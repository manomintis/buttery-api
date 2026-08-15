import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Post,
  Req,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { type AuthenticatedRequest } from 'src/auth/user.guard';
import { CreateQuoteDto } from './create-quote.dto';
import { UpdateQuoteDto } from './update-quote.dto';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  async quoteList(@Req() request: AuthenticatedRequest) {
    const user = request.user;
    return await this.quotesService.getQuotesForTenant(user);
  }

  @Put()
  async quoteCreate(
    @Req() request: AuthenticatedRequest,
    @Body() quote: CreateQuoteDto,
  ) {
    return await this.quotesService.createQuoteForTenant(request.user, quote);
  }

  @Post(':id')
  async quoteUpdate(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() quote: UpdateQuoteDto,
  ) {
    return await this.quotesService.updateQuoteForTenant(
      request.user,
      id,
      quote,
    );
  }
}
