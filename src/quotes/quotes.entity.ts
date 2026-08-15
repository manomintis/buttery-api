import { Organization } from 'src/organizations/organizations.entity';
import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { v7 as uuid } from 'uuid';
import { QuoteStatus } from './quote-status.enum';
import { Section } from './sections.entity';

@Entity('quotes')
export class Quote {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  organizationId!: string;

  @Column({ length: 255 })
  customerName!: string;

  @Column({
    type: 'simple-enum',
    enum: QuoteStatus,
    default: QuoteStatus.Draft,
  })
  status!: QuoteStatus;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @OneToMany(() => Section, (section) => section.quote)
  sections!: Section[];

  @BeforeInsert()
  generateId(): void {
    this.id ??= uuid();
  }
}
