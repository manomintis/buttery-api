import { DataSource } from 'typeorm';
import { Organization } from '../../organizations/organizations.entity';
import { DiscountType } from '../../quotes/discount-type.enum';
import { QuoteStatus } from '../../quotes/quote-status.enum';
import { Quote } from '../../quotes/quotes.entity';
import { Seeder } from '../seeder.interface';
import { CONTROL_ORGANIZATION } from './organizations.seeder';

// Tax rates and percentage discounts are in basis points. See `totals.ts`.
const QUOTES = [
  {
    customerName: 'Acme Roofing',
    status: QuoteStatus.Draft,
    discountType: DiscountType.Percentage,
    discountValue: 500, // 5%
    taxRate: 825, // 8.25%
  },
  {
    customerName: 'Bellweather Cafe',
    status: QuoteStatus.Sent,
    discountType: DiscountType.Fixed,
    discountValue: 2500, // $25.00
    taxRate: 700, // 7%
  },
];

// No discount and an 8% tax rate, so this quote comes to the $297.00 in the brief.
export const CONTROL_QUOTE = {
  customerName: 'Control Case',
  status: QuoteStatus.Draft,
  taxRate: 800,
};

export class QuotesSeeder implements Seeder {
  readonly name = 'quotes';

  async run(dataSource: DataSource): Promise<void> {
    const organizations = await dataSource.getRepository(Organization).find();
    const repository = dataSource.getRepository(Quote);

    await repository.save(
      repository.create(
        organizations.flatMap((organization) =>
          (organization.name === CONTROL_ORGANIZATION
            ? [CONTROL_QUOTE]
            : QUOTES
          ).map((quote) => ({ ...quote, organization })),
        ),
      ),
    );
  }

  async clear(dataSource: DataSource): Promise<void> {
    await dataSource.createQueryBuilder().delete().from(Quote).execute();
  }
}
