import { DiscountType } from './discount-type.enum';
import { quoteTotals } from './totals';

const section = (markup: number, items: [number, number][]) => ({
  markup,
  items: items.map(([quantity, price]) => ({ quantity, price })),
});

describe('quoteTotals', () => {
  it('matches the worked example from the brief', () => {
    // Two lines at 2 × $100 and 1 × $50 is $250. A 10% section markup makes
    // it $275. With an 8% tax rate the quote total is $297.00.
    const totals = quoteTotals({
      taxRate: 800,
      sections: [
        section(10, [
          [2, 10000],
          [1, 5000],
        ]),
      ],
    });

    expect(totals.sections[0].lines).toEqual([20000, 5000]);
    expect(totals.sections[0].lineSubtotal).toBe(25000);
    expect(totals.sections[0].markup).toBe(2500);
    expect(totals.sections[0].subtotal).toBe(27500);
    expect(totals.subtotal).toBe(27500);
    expect(totals.discount).toBe(0);
    expect(totals.tax).toBe(2200);
    expect(totals.total).toBe(29700);
  });

  it('adds up the subtotals of every section', () => {
    const totals = quoteTotals({
      sections: [section(0, [[1, 1000]]), section(0, [[2, 2500]])],
    });

    expect(totals.subtotal).toBe(6000);
    expect(totals.total).toBe(6000);
  });

  it('takes a percentage discount off the quote subtotal before tax', () => {
    const totals = quoteTotals({
      discountType: DiscountType.Percentage,
      discountValue: 1000, // 10%
      taxRate: 1000, // 10%
      sections: [section(0, [[1, 10000]])],
    });

    expect(totals.discount).toBe(1000);
    expect(totals.taxable).toBe(9000);
    expect(totals.tax).toBe(900);
    expect(totals.total).toBe(9900);
  });

  it('takes a fixed discount as an amount in cents', () => {
    const totals = quoteTotals({
      discountType: DiscountType.Fixed,
      discountValue: 2500,
      taxRate: 1000,
      sections: [section(0, [[1, 10000]])],
    });

    expect(totals.discount).toBe(2500);
    expect(totals.taxable).toBe(7500);
    expect(totals.total).toBe(8250);
  });

  it('never lets a discount take the quote below zero', () => {
    const totals = quoteTotals({
      discountType: DiscountType.Fixed,
      discountValue: 999999,
      taxRate: 800,
      sections: [section(0, [[1, 10000]])],
    });

    expect(totals.discount).toBe(10000);
    expect(totals.taxable).toBe(0);
    expect(totals.tax).toBe(0);
    expect(totals.total).toBe(0);
  });

  it('ignores a discount value with no discount type', () => {
    const totals = quoteTotals({
      discountValue: 5000,
      sections: [section(0, [[1, 10000]])],
    });

    expect(totals.discount).toBe(0);
    expect(totals.total).toBe(10000);
  });

  it('rounds a markup of half a cent up', () => {
    // $0.05 with a 15% markup is 0.75 of a cent.
    const totals = quoteTotals({ sections: [section(15, [[1, 5]])] });

    expect(totals.sections[0].markup).toBe(1);
    expect(totals.sections[0].subtotal).toBe(6);
  });

  it('rounds exactly half a cent up rather than to even', () => {
    // $0.10 with a 5% markup is exactly half a cent.
    const totals = quoteTotals({ sections: [section(5, [[1, 10]])] });

    expect(totals.sections[0].markup).toBe(1);
  });

  it('rounds each section separately, so the sections add up to the subtotal', () => {
    const totals = quoteTotals({
      sections: [section(15, [[1, 5]]), section(15, [[1, 5]])],
    });

    expect(totals.sections.map((entry) => entry.subtotal)).toEqual([6, 6]);
    expect(totals.subtotal).toBe(12);
  });

  it('charges tax once on the whole quote rather than section by section', () => {
    // Each section taxed alone would round to 1 cent, giving 2. Charged on the
    // $0.10 total, the tax is 0.5 of a cent, which rounds to 1.
    const totals = quoteTotals({
      taxRate: 500, // 5%
      sections: [section(0, [[1, 5]]), section(0, [[1, 5]])],
    });

    expect(totals.subtotal).toBe(10);
    expect(totals.tax).toBe(1);
    expect(totals.total).toBe(11);
  });

  it('handles a quote with no sections', () => {
    const totals = quoteTotals({ taxRate: 800 });

    expect(totals).toEqual({
      sections: [],
      subtotal: 0,
      discount: 0,
      taxable: 0,
      tax: 0,
      total: 0,
    });
  });

  it('handles a section with no items and no markup set', () => {
    const totals = quoteTotals({ sections: [{}] });

    expect(totals.sections[0]).toEqual({
      lines: [],
      lineSubtotal: 0,
      markup: 0,
      subtotal: 0,
    });
  });
});
