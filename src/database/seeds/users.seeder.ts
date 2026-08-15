import { DataSource } from 'typeorm';
import { Organization } from '../../organizations/organizations.entity';
import { User } from '../../quotes/users.entity';
import { Seeder } from '../seeder.interface';

export class UsersSeeder implements Seeder {
  readonly name = 'users';

  async run(dataSource: DataSource): Promise<void> {
    const organizations = await dataSource.getRepository(Organization).find();
    const repository = dataSource.getRepository(User);

    await repository.save(
      repository.create(
        organizations.map((organization) => ({
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
