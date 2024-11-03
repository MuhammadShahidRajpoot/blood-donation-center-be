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
import { SegmentTypeEnum } from '../enums/segment-type.enum';
import { UserRequest } from 'src/common/interface/request';
import { CallJobsCallSegmentsDto } from '../dto/call-jobs-call-segments.dto';

@Entity()
export class CallJobsCallSegments {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(() => CallJobs, (callJob) => callJob.id, { nullable: false })
  @JoinColumn({ name: 'call_job_id' })
  call_job_id: CallJobs;

  @Column({ nullable: false, type: 'bigint' })
  segment_id: bigint;

  @ManyToOne(() => Segments, (segment) => segment.id, { nullable: false })
  @JoinColumn({ name: 'segment_id' })
  segment: Segments;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_archived: boolean;

  @Column({
    type: 'enum',
    enum: SegmentTypeEnum,
  })
  segment_type: string;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  constructor(dto?: CallJobsCallSegmentsDto, request?: UserRequest) {
    if (dto) {
      Object.assign(this, dto);
      this.created_by = request?.user?.id;
    }
  }
}
