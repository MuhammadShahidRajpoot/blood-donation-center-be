import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { User } from '../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { UserRequest } from 'src/common/interface/request';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { CallJobs } from '../../call-jobs/entities/call-jobs.entity';
import { TelerecruitmentRequestsStatusEnum } from '../enums/telerecruitment-requests.enum';

@Entity('telerecruitment_requests')
export class TelerecruitmentRequests {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ type: 'bigint' })
  call_job_id: bigint;

  @ManyToOne(() => CallJobs, (callJob) => callJob.id, { nullable: true })
  @JoinColumn({ name: 'call_job_id' })
  call_job: CallJobs;

  @Column({
    type: 'enum',
    enum: TelerecruitmentRequestsStatusEnum,
  })
  job_status: string;

  @Column({ type: 'bigint' })
  drive_id: bigint;

  @ManyToOne(() => Drives, (drive) => drive.id, { nullable: false })
  @JoinColumn({ name: 'drive_id' })
  drive: Drives;

  @Column({ type: 'boolean' })
  is_created: boolean;

  @Column({ type: 'boolean' })
  is_accepted: boolean;

  @Column({ type: 'boolean' })
  is_declined: boolean;

  @Column({ type: 'bigint' })
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

  // Additional fields related to 'created_by' would be required to store the actual bigint ID, which is assumed to be a foreign key.
  // The other fields in the original snippet are omitted as they are not present in the screenshot.
}
