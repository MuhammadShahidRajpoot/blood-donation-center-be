import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { User } from '../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';
import { CallJobs } from './call-jobs.entity';

@Entity('call_jobs_history')
export class CallJobsHistory extends GenericHistoryEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({ type: 'varchar', length: 1, nullable: false })
  history_reason: string;

  @Column({ type: 'bigint', nullable: false })
  id: bigint;

  @ManyToOne(() => CallJobs, { nullable: false })
  @JoinColumn({ name: 'id' })
  callJobs: CallJobs;

  @Column({ type: 'timestamp', precision: 6 })
  start_date: Date;

  @Column({ type: 'timestamp', precision: 6 })
  end_date: Date;

  @Column({
    type: 'text',
    nullable: false,
  })
  status: string;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'int', nullable: true })
  recurring_frequency: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recurring_days: string;

  @Column({ type: 'timestamp', nullable: true })
  recurring_end_date: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recurring_type: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  is_active: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_assigned: boolean;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_archived: boolean;

  @Column({
    type: 'timestamp',
    default: new Date(),
    nullable: false,
  })
  created_at: Date;

  @Column({ type: 'bigint', nullable: false })
  created_by: bigint;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by_user: User;
}
