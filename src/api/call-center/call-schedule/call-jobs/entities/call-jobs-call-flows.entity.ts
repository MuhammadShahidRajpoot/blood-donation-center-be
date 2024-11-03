import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { CallJobs } from './call-jobs.entity';
import { Segments } from 'src/api/call-center/manage-segments/entities/segments.entity';
import { CallFlowsEntity } from 'src/api/system-configuration/tenants-administration/call-flows/entity/call-flows.entity';

@Entity()
export class CallJobsCallFlows {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(() => CallJobs, (callJob) => callJob.id, { nullable: false })
  @JoinColumn({ name: 'call_job_id' })
  call_job_id: CallJobs;

  @Column({ nullable: false, type: 'bigint' })
  call_flow_id: bigint;

  @ManyToOne(() => CallFlowsEntity, (callFlow) => callFlow.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'call_flow_id' })
  call_flow: Segments;

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
}
