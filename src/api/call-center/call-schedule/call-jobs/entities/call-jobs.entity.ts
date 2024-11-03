import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { User } from '../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { CallJobStatusEnum } from '../enums/call-job-status.enum';
import { CallJobsdDto } from '../dto/call-jobs.dto';
import { UserRequest } from 'src/common/interface/request';

@Entity('call_jobs')
export class CallJobs {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ type: 'timestamp', precision: 6 })
  start_date: Date;

  @Column({ type: 'timestamp', precision: 6 })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: CallJobStatusEnum,
  })
  status: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_recurring: boolean;

  @Column({ type: 'int', nullable: true })
  recurring_frequency: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recurring_days: string;

  @Column({ type: 'timestamp', precision: 6, nullable: true })
  recurring_end_date: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recurring_type: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_archived: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_assigned: boolean;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  constructor(dto?: CallJobsdDto, request?: UserRequest) {
    if (dto) {
      Object.assign(this, dto);
      this.tenant_id = request?.user?.tenant?.id;
      this.created_by = request?.user?.id;
    }
  }
}
