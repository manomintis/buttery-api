import { DataSource } from 'typeorm';
import { Quote } from '../../quotes/quotes.entity';
import { Section } from '../../quotes/sections.entity';
import { Seeder } from '../seeder.interface';
import { CONTROL_ORGANIZATION } from './organizations.seeder';

const SECTIONS = [
  { name: 'Labour', markup: 15 },
  { name: 'Materials', markup: 30 },
  { name: 'Equipment', markup: 10 },
];

export const CONTROL_SECTION = { name: 'Control Section', markup: 10 };

export class SectionsSeeder implements Seeder {
  readonly name = 'sections';

  async run(dataSource: DataSource): Promise<void> {
    const quotes = await dataSource
      .getRepository(Quote)
      .find({ relations: { organization: true } });
    const repository = dataSource.getRepository(Section);

    await repository.save(
      repository.create(
        quotes.flatMap((quote) =>
          (quote.organization.name === CONTROL_ORGANIZATION
            ? [CONTROL_SECTION]
            : SECTIONS
          ).map((section) => ({ ...section, quote })),
        ),
      ),
    );
  }

  async clear(dataSource: DataSource): Promise<void> {
    await dataSource.createQueryBuilder().delete().from(Section).execute();
  }
}
