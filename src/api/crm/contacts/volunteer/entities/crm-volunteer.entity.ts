import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { Prefixes } from '../../common/prefixes/entities/prefixes.entity';
import { Suffixes } from '../../common/suffixes/entities/suffixes.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class CRMVolunteer extends GenericEntity {
  @ManyToOne(() => Prefixes, (prefixes) => prefixes.id, { nullable: true })
  @JoinColumn({ name: 'prefix_id' })
  @Column({ type: 'bigint', nullable: true })
  prefix_id: bigint;

  @ManyToOne(() => Suffixes, (suffixes) => suffixes.id, { nullable: true })
  @JoinColumn({ name: 'suffix_id' })
  @Column({ type: 'bigint', nullable: true })
  suffix_id: bigint;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  employee: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  nick_name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  last_name: string;

  @Column({ type: 'timestamp', precision: 6, nullable: false })
  birth_date: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  contact_uuid: string;

  @BeforeInsert()
  async generateUUID() {
    this.contact_uuid = uuidv4();
  }

  @Column({ name: 'dsid', type: 'varchar', length: 255, nullable: true })
  dsid: string;
}
