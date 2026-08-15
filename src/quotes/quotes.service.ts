import { DeepPartial, Repository } from 'typeorm';
import { Quote } from './quotes.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type User } from './users.entity';
import { type CreateQuoteDto } from './create-quote.dto';
import {
  type UpdateItemDto,
  type UpdateQuoteDto,
  type UpdateSectionDto,
} from './update-quote.dto';
import { Section } from './sections.entity';
import { Item } from './items.entity';
import { DiscountType } from './discount-type.enum';
import { quoteTotals, type QuoteTotals } from './totals';

export type QuoteWithTotals = Quote & { totals: QuoteTotals };

const MAX_PERCENTAGE_DISCOUNT = 10000;

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
  ) {}

  private async getOrgQuotes(organizationId: string): Promise<Quote[] | null> {
    return await this.quoteRepository.find({
      where: { organizationId },
      order: { id: 'ASC' },
    });
  }

  private async getOrgQuote(
    quotes: Repository<Quote>,
    organizationId: string,
    id: string,
  ): Promise<Quote | null> {
    return await quotes.findOne({
      where: { organizationId, id },
      relations: { sections: { items: true } },
      order: {
        sections: { id: 'ASC', items: { id: 'ASC' } },
      },
    });
  }

  getQuotesForTenant(user: User): Promise<Quote[] | null> {
    return this.getOrgQuotes(user.organizationId);
  }

  async getQuoteForTenant(user: User, id: string): Promise<QuoteWithTotals> {
    const quote = await this.getOrgQuote(
      this.quoteRepository,
      user.organizationId,
      id,
    );

    if (!quote) {
      throw new NotFoundException(`Quote ${id} not found`);
    }

    return this.withTotals(quote);
  }

  async createQuoteForTenant(
    user: User,
    quote: CreateQuoteDto,
  ): Promise<QuoteWithTotals> {
    this.rejectSuppliedIds(quote);
    this.rejectExcessiveDiscount(quote.discountType, quote.discountValue);

    const created = await this.quoteRepository.save(
      this.quoteRepository.create({
        organizationId: user.organizationId,
        customerName: quote.customerName,
        status: quote.status,
        discountType: quote.discountType,
        discountValue: quote.discountValue,
        taxRate: quote.taxRate,
        sections: quote.sections?.map((section) => ({
          name: section.name,
          markup: section.markup,
          items: section.items?.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
        })),
      }),
    );

    return await this.getQuoteForTenant(user, created.id);
  }

  private withTotals(quote: Quote): QuoteWithTotals {
    return Object.assign(quote, { totals: quoteTotals(quote) });
  }

  private rejectSuppliedIds(quote: CreateQuoteDto): void {
    const submitted = [
      quote,
      ...(quote.sections ?? []).flatMap((section) => [
        section,
        ...(section.items ?? []),
      ]),
    ];

    if (submitted.some((entry) => 'id' in entry)) {
      throw new BadRequestException('IDs cannot be supplied when creating');
    }
  }

  async updateQuoteForTenant(
    user: User,
    id: string,
    update: UpdateQuoteDto,
  ): Promise<QuoteWithTotals> {
    return await this.quoteRepository.manager.transaction(async (manager) => {
      const quotes = manager.getRepository(Quote);
      const quote = await this.getOrgQuote(quotes, user.organizationId, id);

      if (!quote) {
        throw new NotFoundException(`Quote ${id} not found`);
      }

      const discountType =
        update.discountType === undefined
          ? quote.discountType
          : update.discountType;
      const discountValue = update.discountValue ?? quote.discountValue;

      this.rejectExcessiveDiscount(discountType, discountValue);

      await quotes.save(
        quotes.create({
          ...quote,
          customerName: update.customerName ?? quote.customerName,
          status: update.status ?? quote.status,
          discountType,
          discountValue,
          taxRate: update.taxRate ?? quote.taxRate,
          sections: update.sections
            ? this.mergeSections(quote.sections, update.sections)
            : quote.sections,
        }),
      );

      const saved = await this.getOrgQuote(quotes, user.organizationId, id);

      if (!saved) {
        throw new NotFoundException(`Quote ${id} not found`);
      }

      return this.withTotals(saved);
    });
  }

  private rejectExcessiveDiscount(
    type: DiscountType | null | undefined,
    value: number | undefined,
  ): void {
    if (
      type === DiscountType.Percentage &&
      (value ?? 0) > MAX_PERCENTAGE_DISCOUNT
    ) {
      throw new BadRequestException(
        'A percentage discount cannot be more than 100%',
      );
    }
  }

  private mergeSections(
    sections: Section[],
    updates: UpdateSectionDto[],
  ): DeepPartial<Section>[] {
    return updates.map((update) => {
      const section = update.id
        ? this.findSection(sections, update.id)
        : undefined;

      return {
        ...section,
        ...update,
        items: update.items
          ? this.mergeItems(section?.items ?? [], update.items)
          : section?.items,
      };
    });
  }

  private mergeItems(
    items: Item[],
    updates: UpdateItemDto[],
  ): DeepPartial<Item>[] {
    return updates.map((update) => ({
      ...(update.id ? this.findItem(items, update.id) : undefined),
      ...update,
    }));
  }

  private findSection(sections: Section[], id: string): Section {
    const section = sections.find((section) => section.id === id);

    if (!section) {
      throw new BadRequestException(
        `Section ${id} does not belong to this quote`,
      );
    }

    return section;
  }

  private findItem(items: Item[], id: string): Item {
    const item = items.find((item) => item.id === id);

    if (!item) {
      throw new BadRequestException(
        `Item ${id} does not belong to this section`,
      );
    }

    return item;
  }
}
