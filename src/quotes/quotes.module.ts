import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { Quote } from './quotes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [QuotesController],
  providers: [QuotesService],
  imports: [TypeOrmModule.forFeature([Quote])],
})
export class QuotesModule {}
