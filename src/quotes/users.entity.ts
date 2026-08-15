import { Organization } from 'src/organizations/organizations.entity';
import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v7 as uuid } from 'uuid';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  organizationId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @BeforeInsert()
  generateId(): void {
    this.id ??= uuid();
  }
}
