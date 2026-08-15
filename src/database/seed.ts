import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { seeders } from './seeds';

async function bootstrap(): Promise<void> {
  const fresh = process.argv.includes('--fresh');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);

    if (fresh) {
      console.log('Dropping and recreating schema...');
      await dataSource.synchronize(true);
    } else {
      for (const seeder of [...seeders].reverse()) {
        await seeder.clear(dataSource);
        console.log(`Cleared ${seeder.name}`);
      }
    }

    for (const seeder of seeders) {
      await seeder.run(dataSource);
      console.log(`Seeded ${seeder.name}`);
    }

    console.log('Seeding complete.');
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
