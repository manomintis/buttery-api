import { Controller, Get, Put, Post } from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  quoteList() {
    return true;
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
