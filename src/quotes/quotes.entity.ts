import { Entity, Column, BeforeInsert, PrimaryColumn } from 'typeorm';
import { v7 as uuid } from 'uuid';
import { QuoteStatus } from './quote-status.enum';

@Entity('quotes')
export class Quote {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  organizationId!: string;

  @Column({ type: 'varchar', length: 255 })
  customerName!: string;

  @Column({
    type: 'simple-enum',
    enum: QuoteStatus,
    default: QuoteStatus.Draft,
  })
  status!: QuoteStatus;

  @BeforeInsert()
  generateId(): void {
    this.id ??= uuid();
  }
}
