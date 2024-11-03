import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Schedule } from './schedules.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';

@Entity()
export class ScheduleOperationStatusHistory {
  @PrimaryColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({ type: 'varchar', nullable: false })
  history_reason: string;

  @Column({ type: 'bigint', nullable: false })
  id: bigint;

  @Column({ type: 'bigint', nullable: false })
  schedule_id: bigint;

  @Column({ type: 'bigint', nullable: false })
  operation_status_id: bigint;

  @Column({ default: false })
  is_archived: boolean;

  @Column({ type: 'bigint', nullable: false })
  created_by: bigint;
}
