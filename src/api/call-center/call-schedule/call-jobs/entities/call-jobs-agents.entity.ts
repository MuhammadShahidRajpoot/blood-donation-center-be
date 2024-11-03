import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { CallJobs } from './call-jobs.entity';
import { UserRequest } from 'src/common/interface/request';
import { CallJobsAgentsDto } from '../dto/call-jobs-agents.dto';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity()
export class CallJobsAgents {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ nullable: false, type: 'bigint' })
  call_job_id: bigint;

  @ManyToOne(() => CallJobs, (callJob) => callJob.id, { nullable: false })
  @JoinColumn({ name: 'call_job_id' })
  call_job: CallJobs;

  @Column({ nullable: false, type: 'bigint' })
  user_id: bigint;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'timestamp', precision: 6 })
  date: Date;

  @Column({ type: 'bigint' })
  assigned_calls: number;

  @Column({ type: 'bigint' })
  actual_calls: number;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_calling: boolean;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_archived: boolean;

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

  constructor(dto?: CallJobsAgentsDto, request?: UserRequest) {
    if (dto) {
      Object.assign(this, dto);
      this.created_by = request?.user?.id;
      this.tenant_id = request?.user?.tenant?.id;
    }
  }
}
