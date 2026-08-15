import { DataSource } from 'typeorm';
import { Organization } from '../../organizations/organizations.entity';
import { Seeder } from '../seeder.interface';

export const CONTROL_ORGANIZATION = 'Nowhereland';
export const WONDERLAND_ORGANIZATION = 'Wonderland';

const ORGANIZATIONS = [
  { name: CONTROL_ORGANIZATION },
  { name: WONDERLAND_ORGANIZATION },
];

export class OrganizationsSeeder implements Seeder {
  readonly name = 'organizations';

  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Organization);
    await repository.save(repository.create(ORGANIZATIONS));
  }

  async clear(dataSource: DataSource): Promise<void> {
    await dataSource.createQueryBuilder().delete().from(Organization).execute();
  }
}
