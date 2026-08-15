import { Controller, Get, Put, Post, Req } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { type AuthenticatedRequest } from 'src/auth/user.guard';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  async quoteList(@Req() request: AuthenticatedRequest) {
    const user = request.user;
    return await this.quotesService.getQuotesForTenant(user);
  }

  @Put()
  quoteCreate() {
    return true;
  }

  @Post()
  quoteUpdate() {
    return true;
  }
}
