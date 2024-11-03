import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { CallJobs } from './call-jobs.entity';
import { ManageScripts } from 'src/api/call-center/manage-scripts/entities/manage-scripts.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity()
export class CallJobsCallScripts {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(() => CallJobs, (callJob) => callJob.id, { nullable: false })
  @JoinColumn({ name: 'call_job_id' })
  call_job_id: CallJobs;

  @Column({ nullable: false, type: 'bigint' })
  call_script_id: bigint;

  @ManyToOne(() => ManageScripts, (callScript) => callScript.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'call_script_id' })
  call_script: ManageScripts;

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
