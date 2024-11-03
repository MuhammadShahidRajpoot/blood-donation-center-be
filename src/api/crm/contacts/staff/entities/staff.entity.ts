import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { StaffingClassification } from 'src/api/system-configuration/tenants-administration/staffing-administration/classifications/entity/classification.entity';
import { Suffixes } from '../../common/suffixes/entities/suffixes.entity';
import { Prefixes } from '../../common/prefixes/entities/prefixes.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Staff extends GenericEntity {
  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;

  @ManyToOne(() => Prefixes, (prefixes) => prefixes.id, { nullable: true })
  @JoinColumn({ name: 'prefix' })
  @Column({ type: 'bigint', nullable: true })
  prefix: bigint;

  @ManyToOne(() => Suffixes, (suffixes) => suffixes.id, { nullable: true })
  @JoinColumn({ name: 'suffix' })
  @Column({ type: 'bigint', nullable: true })
  suffix: bigint;

  @Column({ type: 'varchar', length: 60, nullable: true })
  nick_name: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  last_name: string;

  @Column({ type: 'timestamp', precision: 6, nullable: false })
  birth_date: Date;

  @Column({ nullable: false, default: new Date() })
  updated_at: Date;

  @ManyToOne(() => BusinessUnits, (unit) => unit.id, { nullable: false })
  @JoinColumn({ name: 'collection_operation_id' })
  collection_operation_id: BusinessUnits;

  @ManyToOne(
    () => StaffingClassification,
    (classification) => classification.id,
    { nullable: false }
  )
  @JoinColumn({ name: 'classification_id' })
  classification_id: StaffingClassification;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

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
