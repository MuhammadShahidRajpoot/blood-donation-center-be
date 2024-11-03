import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { CallJobs } from '../../call-schedule/call-jobs/entities/call-jobs.entity';
import { SegmentsContacts } from './segments-contacts.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { CallOutcomes } from 'src/api/system-configuration/tenants-administration/call-outcomes/entities/call-outcomes.entity';
import { call_status } from 'src/api/common/enums/call-center.enums';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity('call_job_contacts')
export class CallJobContacts {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(() => CallJobs, (callJob) => callJob.id, { nullable: false })
  @JoinColumn({ name: 'call_job_id' })
  call_job_id: CallJobs;

  @Column({ nullable: false, type: 'bigint' })
  segment_contact_id: bigint;

  @ManyToOne(() => SegmentsContacts, (segmentContact) => segmentContact.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'segment_contact_id' })
  segment_contact: SegmentsContacts;

  @Column({ type: 'bigint', nullable: false })
  no_of_retry: bigint;

  @Column({ type: 'bigint', nullable: false })
  max_call_count: bigint;

  @Column({ type: 'bigint', nullable: true })
  call_outcome_id: bigint;

  @ManyToOne(() => CallOutcomes, { nullable: true })
  @JoinColumn({ name: 'call_outcome_id' })
  callOutcome: CallOutcomes;

  @Column({ type: 'enum', enum: call_status })
  call_status: call_status;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
