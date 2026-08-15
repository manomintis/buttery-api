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

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
  ) {}

  private async getOrgQuotes(organizationId: string): Promise<Quote[] | null> {
    return await this.quoteRepository.find({
      where: { organizationId },
      relations: { sections: { items: true } },
      order: {
        id: 'ASC',
        sections: { id: 'ASC', items: { id: 'ASC' } },
      },
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

  async getQuoteForTenant(user: User, id: string): Promise<Quote> {
    const quote = await this.getOrgQuote(
      this.quoteRepository,
      user.organizationId,
      id,
    );

    if (!quote) {
      throw new NotFoundException(`Quote ${id} not found`);
    }

    return quote;
  }

  createQuoteForTenant(user: User, quote: CreateQuoteDto): Promise<Quote> {
    this.rejectSuppliedIds(quote);

    return this.quoteRepository.save(
      this.quoteRepository.create({
        organizationId: user.organizationId,
        customerName: quote.customerName,
        status: quote.status,
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
  ): Promise<Quote | null> {
    return await this.quoteRepository.manager.transaction(async (manager) => {
      const quotes = manager.getRepository(Quote);
      const quote = await this.getOrgQuote(quotes, user.organizationId, id);

      if (!quote) {
        throw new NotFoundException(`Quote ${id} not found`);
      }

      await quotes.save(
        quotes.create({
          ...quote,
          customerName: update.customerName ?? quote.customerName,
          status: update.status ?? quote.status,
          sections: update.sections
            ? this.mergeSections(quote.sections, update.sections)
            : quote.sections,
        }),
      );

      return await this.getOrgQuote(quotes, user.organizationId, id);
    });
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
