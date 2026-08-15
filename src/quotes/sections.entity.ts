import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v7 as uuid } from 'uuid';
import { Item } from './items.entity';
import { Quote } from './quotes.entity';

@Entity('sections')
export class Section {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'int', default: 0 })
  markup!: number;

  @ManyToOne(() => Quote, (quote) => quote.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quoteId' })
  quote!: Quote;

  @OneToMany(() => Item, (item) => item.section, {
    cascade: ['insert', 'update'],
    orphanedRowAction: 'delete',
  })
  items!: Item[];

  @BeforeInsert()
  generateId(): void {
    this.id ??= uuid();
  }
}
