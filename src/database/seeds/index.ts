import { Seeder } from '../seeder.interface';
import { ItemsSeeder } from './items.seeder';
import { OrganizationsSeeder } from './organizations.seeder';
import { QuotesSeeder } from './quotes.seeder';
import { SectionsSeeder } from './sections.seeder';
import { UsersSeeder } from './users.seeder';

export const seeders: Seeder[] = [
  new OrganizationsSeeder(),
  new UsersSeeder(),
  new QuotesSeeder(),
  new SectionsSeeder(),
  new ItemsSeeder(),
];
