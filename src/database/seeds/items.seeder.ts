import { DataSource } from 'typeorm';
import { Item } from '../../quotes/items.entity';
import { Section } from '../../quotes/sections.entity';
import { Seeder } from '../seeder.interface';
import { CONTROL_ORGANIZATION } from './organizations.seeder';

const ITEMS = [
  { description: 'Site survey', quantity: 1, price: 25000 },
  { description: 'Crew hours', quantity: 8, price: 7500 },
  { description: 'Fixings and sealant', quantity: 3, price: 1200 },
];

export const CONTROL_ITEMS = [
  { description: 'Control line A', quantity: 2, price: 10000 },
  { description: 'Control line B', quantity: 1, price: 5000 },
];

export class ItemsSeeder implements Seeder {
  readonly name = 'items';

  async run(dataSource: DataSource): Promise<void> {
    const sections = await dataSource
      .getRepository(Section)
      .find({ relations: { quote: { organization: true } } });
    const repository = dataSource.getRepository(Item);

    await repository.save(
      repository.create(
        sections.flatMap((section) =>
          (section.quote.organization.name === CONTROL_ORGANIZATION
            ? CONTROL_ITEMS
            : ITEMS
          ).map((item) => ({ ...item, section })),
        ),
      ),
    );
  }

  async clear(dataSource: DataSource): Promise<void> {
    await dataSource.createQueryBuilder().delete().from(Item).execute();
  }
}
