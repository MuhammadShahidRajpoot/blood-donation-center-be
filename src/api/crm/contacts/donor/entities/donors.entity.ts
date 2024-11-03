import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { Prefixes } from '../../common/prefixes/entities/prefixes.entity';
import { Suffixes } from '../../common/suffixes/entities/suffixes.entity';
import { BBCSDonorType } from '../enum/bbcs-donor-type.enum';
import { v4 as uuidv4 } from 'uuid';
import { BecsRaces } from './becs-race.entity';
import { BloodGroups } from './blood-group.entity';

@Entity()
export class Donors extends GenericEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  external_id: string;

  @ManyToOne(() => Prefixes, (prefixes) => prefixes.id, { nullable: true })
  @JoinColumn({ name: 'prefix_id' })
  @Column({ type: 'bigint', nullable: true })
  prefix_id: bigint;

  @ManyToOne(() => Suffixes, (suffixes) => suffixes.id, { nullable: true })
  @JoinColumn({ name: 'suffix_id' })
  @Column({ type: 'bigint', nullable: true })
  suffix_id: bigint;

  @Column({ type: 'varchar', length: 60, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  last_name: string;

  @Column({ type: 'timestamp', precision: 6, nullable: false })
  birth_date: Date;

  @Column({ type: 'varchar', length: 60, nullable: true })
  nick_name: string;

  @ManyToOne(() => BloodGroups, (bloodGroups) => bloodGroups.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'blood_group_id' })
  blood_group_id: BloodGroups;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @Column({ nullable: true })
  bbcs_donor_type: BBCSDonorType;

  @Column({ nullable: false, default: false })
  is_synced: boolean;

  @Column({ type: 'varchar', nullable: true })
  middle_name: string;

  @Column({ type: 'date', nullable: true })
  record_create_date: Date;

  @Column({ type: 'date', nullable: true })
  last_update_date: Date;

  @Column({ type: 'date', nullable: true })
  next_recruit_date: Date;

  @Column({ type: 'date', nullable: true })
  greatest_deferral_date: Date;

  @Column({ type: 'date', nullable: true })
  last_donation_date: Date;

  @Column({ type: 'date', nullable: true })
  appointment_date: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string;

  @Column({ type: 'varchar', nullable: true })
  geo_code: string;

  @Column({ type: 'varchar', nullable: true })
  group_category: string;

  @ManyToOne(() => BecsRaces, (becsRace) => becsRace.id, { nullable: false })
  @JoinColumn({ name: 'race_id' })
  race_id: BecsRaces;

  @Column({ type: 'varchar', nullable: true })
  misc_code: string;

  @Column({ type: 'varchar', nullable: true })
  rec_result: string;

  @Column({ type: 'int', nullable: false })
  gallon_award1: number;

  @Column({ type: 'int', nullable: false })
  gallon_award2: number;

  @Column({ type: 'int', nullable: false })
  donor_number: number;

  @Column({ nullable: false, default: new Date() })
  updated_at: Date;

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
