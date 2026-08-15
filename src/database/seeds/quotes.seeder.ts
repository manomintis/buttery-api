import { DataSource } from 'typeorm';
import { Organization } from '../../organizations/organizations.entity';
import { QuoteStatus } from '../../quotes/quote-status.enum';
import { Quote } from '../../quotes/quotes.entity';
import { Seeder } from '../seeder.interface';
import { CONTROL_ORGANIZATION } from './organizations.seeder';

const QUOTES = [
  { customerName: 'Acme Roofing', status: QuoteStatus.Draft },
  { customerName: 'Bellweather Cafe', status: QuoteStatus.Sent },
];

export const CONTROL_QUOTE = {
  customerName: 'Control Case',
  status: QuoteStatus.Draft,
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
