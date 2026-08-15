import { Repository } from 'typeorm';
import { Quote } from './quotes.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type User } from './users.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
  ) {}

  private async getOrgQuotes(organizationId: string): Promise<Quote[] | null> {
    return await this.quoteRepository.find({ where: { organizationId } });
  }

  getQuotesForTenant(user: User): Promise<Quote[] | null> {
    return this.getOrgQuotes(user.organizationId);
  }
}
