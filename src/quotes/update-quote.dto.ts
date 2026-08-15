import { QuoteStatus } from './quote-status.enum';

export interface UpdateQuoteDto {
  customerName?: string;
  status?: QuoteStatus;
  sections?: UpdateSectionDto[];
}

export interface UpdateSectionDto {
  id?: string;
  name?: string;
  markup?: number;
  items?: UpdateItemDto[];
}

export interface UpdateItemDto {
  id?: string;
  description?: string;
  quantity?: number;
  price?: number;
}
