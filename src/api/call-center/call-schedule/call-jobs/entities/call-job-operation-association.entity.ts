import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../../../api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { User } from '../../../../../api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { OperationTypeEnum } from '../enums/operation-type.enum';
import { CallJobs } from './call-jobs.entity';
import { CallJobsAssociatedOperationDto } from '../dto/call-job-associated-operation.dto';
import { UserRequest } from 'src/common/interface/request';

@Entity()
export class CallJobsAssociatedOperations {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(() => CallJobs, (callJob) => callJob.id, { nullable: false })
  @JoinColumn({ name: 'call_job_id' })
  call_job_id: CallJobs;

  @Column({ type: 'bigint' })
  operationable_id: number;

  @Column({
    type: 'enum',
    enum: OperationTypeEnum,
  })
  operationable_type: string;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  constructor(dto?: CallJobsAssociatedOperationDto, request?: UserRequest) {
    if (dto) {
      Object.assign(this, dto);
      this.created_by = request?.user?.id;
    }
  }
}
