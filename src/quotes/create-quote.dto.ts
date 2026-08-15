import { QuoteStatus } from './quote-status.enum';

export interface CreateQuoteDto {
  customerName: string;
  status?: QuoteStatus;
  sections?: CreateSectionDto[];
}

export interface CreateSectionDto {
  name: string;
  markup?: number;
  items?: CreateItemDto[];
}

export interface CreateItemDto {
  description: string;
  quantity?: number;
  price?: number;
}
