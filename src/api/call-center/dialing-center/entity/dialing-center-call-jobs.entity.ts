import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CallJobs } from '../../call-schedule/call-jobs/entities/call-jobs.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity('dialing_center_call_jobs')
export class DialingCenterCallJobs {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(() => CallJobs, (callJob) => callJob.id, { nullable: false })
  @JoinColumn({ name: 'call_job_id' })
  call_job: CallJobs;

  @Column({ type: 'bigint', nullable: false })
  call_job_id: bigint;

  @Column({ type: 'int', nullable: false })
  actual_calls: number;

  @Column({ type: 'boolean', default: false })
  is_start_calling: boolean;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: number;
}
