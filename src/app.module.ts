import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationsModule } from './organizations/organizations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    OrganizationsModule,
    QuotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
