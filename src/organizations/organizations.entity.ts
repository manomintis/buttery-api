import { Entity, Column, BeforeInsert, PrimaryColumn } from 'typeorm';
import { v7 as uuid } from 'uuid';

@Entity('organizations')
export class Organization {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @BeforeInsert()
  generateId(): void {
    this.id ??= uuid();
  }
}
