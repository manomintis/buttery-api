import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v7 as uuid } from 'uuid';
import { Section } from './sections.entity';

@Entity('items')
export class Item {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'int', default: 0 })
  price!: number;

  @ManyToOne(() => Section, (section) => section.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sectionId' })
  section!: Section;

  @BeforeInsert()
  generateId(): void {
    this.id ??= uuid();
  }
}
