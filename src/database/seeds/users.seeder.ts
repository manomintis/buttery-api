import { DataSource } from 'typeorm';
import { Organization } from '../../organizations/organizations.entity';
import { User } from '../../quotes/users.entity';
import { Seeder } from '../seeder.interface';
import {
  CONTROL_ORGANIZATION,
  WONDERLAND_ORGANIZATION,
} from './organizations.seeder';

export const USER_IDS: Record<string, string> = {
  [CONTROL_ORGANIZATION]: '01900000-0000-7000-8000-000000000001',
  [WONDERLAND_ORGANIZATION]: '01900000-0000-7000-8000-000000000002',
};

export class UsersSeeder implements Seeder {
  readonly name = 'users';

  async run(dataSource: DataSource): Promise<void> {
    const organizations = await dataSource.getRepository(Organization).find();
    const repository = dataSource.getRepository(User);

    await repository.save(
      repository.create(
        organizations.map((organization) => ({
          id: USER_IDS[organization.name],
          name: `${organization.name} user`,
          organization,
        })),
      ),
    );
  }

  async clear(dataSource: DataSource): Promise<void> {
    await dataSource.createQueryBuilder().delete().from(User).execute();
  }
}
