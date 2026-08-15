import { DiscountType } from './discount-type.enum';

const PERCENT = 100;
const BASIS_POINTS = 10000;

export interface QuoteInput {
  discountType?: DiscountType | null;
  discountValue?: number | null;
  taxRate?: number | null;
  sections?: SectionInput[] | null;
}

export interface SectionInput {
  markup?: number | null;
  items?: ItemInput[] | null;
}

export interface ItemInput {
  quantity?: number | null;
  price?: number | null;
}

export interface SectionTotals {
  lines: number[];
  lineSubtotal: number;
  markup: number;
  subtotal: number;
}

export interface QuoteTotals {
  sections: SectionTotals[];
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
}

export function quoteTotals(quote: QuoteInput): QuoteTotals {
  const sections = (quote.sections ?? []).map(sectionTotals);
  const subtotal = sum(sections.map((section) => section.subtotal));
  const discount = discountAmount(quote, subtotal);
  const taxable = subtotal - discount;
  const tax = share(taxable, quote.taxRate ?? 0, BASIS_POINTS);

  return { sections, subtotal, discount, taxable, tax, total: taxable + tax };
}

export function sectionTotals(section: SectionInput): SectionTotals {
  const lines = (section.items ?? []).map(
    (item) => (item.quantity ?? 0) * (item.price ?? 0),
  );
  const lineSubtotal = sum(lines);
  const markup = share(lineSubtotal, section.markup ?? 0, PERCENT);

  return { lines, lineSubtotal, markup, subtotal: lineSubtotal + markup };
}

function discountAmount(quote: QuoteInput, subtotal: number): number {
  const value = quote.discountValue ?? 0;

  if (!quote.discountType || value <= 0) {
    return 0;
  }

  const amount =
    quote.discountType === DiscountType.Percentage
      ? share(subtotal, value, BASIS_POINTS)
      : value;

  return Math.min(amount, subtotal);
}

function share(amount: number, rate: number, scale: number): number {
  return Math.floor((amount * rate + scale / 2) / scale);
}

function sum(values: number[]): number {
  return values.reduce((running, value) => running + value, 0);
}
