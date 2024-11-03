import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Donors } from '../../entities/donors.entity';
import { Accounts } from 'src/api/crm/accounts/entities/accounts.entity';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Facility } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/entity/facility.entity';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { Procedure } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedures/entities/procedure.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';

@Entity('donors_donations')
export class DonorDonations extends GenericEntity {
  @ManyToOne(() => Donors, (donor) => donor.id, { nullable: false })
  @JoinColumn({ name: 'donor_id' })
  donor_id: Donors;

  @ManyToOne(() => Procedure, (procedure) => procedure.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'donation_type' })
  donation_type: ProcedureTypes;

  @Column({ type: 'date', nullable: true })
  donation_date: Date;

  @Column({ type: 'int' })
  donation_status: number;

  @Column({ type: 'date', nullable: true })
  next_eligibility_date: Date;

  @Column({ type: 'int' })
  donation_ytd: number;

  @Column({ type: 'int' })
  donation_ltd: number;

  @Column({ type: 'int' })
  donation_last_year: number;

  @ManyToOne(() => Accounts, (account) => account.id, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account_id: Accounts;

  @ManyToOne(() => Sessions, (sessions) => sessions.id, { nullable: true })
  @JoinColumn({ name: 'sessions_id' })
  sessions: Sessions;

  @Column({ type: 'bigint' })
  sessions_id: bigint;

  @ManyToOne(() => Drives, (drive) => drive.id, { nullable: false })
  @JoinColumn({ name: 'drive_id' })
  drive: Drives;

  @Column({ type: 'bigint' })
  drive_id: bigint;

  @ManyToOne(() => Facility, (facility) => facility.id)
  @JoinColumn({ name: 'facility_id' })
  facility_id: Facility;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'int' })
  procedure_id: bigint;

  @Column({ type: 'int' })
  appointment_id: bigint;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant_id: Tenant;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bbcs_uuid: string;
}
