import { Repository } from 'typeorm';
import { Quote } from './quotes.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type User } from './users.entity';
import { type CreateQuoteDto } from './create-quote.dto';

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

  getQuotesForTenant(user: User): Promise<Quote[] | null> {
    return this.getOrgQuotes(user.organizationId);
  }

  createQuoteForTenant(user: User, quote: CreateQuoteDto): Promise<Quote> {
    return this.quoteRepository.save(
      this.quoteRepository.create({
        ...quote,
        organizationId: user.organizationId,
      }),
    );
  }
}
