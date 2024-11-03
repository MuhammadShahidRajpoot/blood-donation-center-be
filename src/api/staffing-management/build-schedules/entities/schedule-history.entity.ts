import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

enum ScheduleStatusEnum {
  Draft = 'Draft',
  Published = 'Published',
}
@Entity()
export class ScheduleHistory extends GenericHistoryEntity {
  @PrimaryColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({ type: 'varchar', nullable: false })
  history_reason: string;

  @Column({ type: 'bigint', nullable: false })
  id: bigint;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ type: 'bigint', nullable: true })
  collection_operation_id: bigint;

  @Column({ default: ScheduleStatusEnum.Draft })
  schedule_status: ScheduleStatusEnum;

  @Column({ type: 'boolean', default: false })
  is_locked: boolean;

  @Column({ type: 'boolean', default: false })
  is_paused: boolean;

  @Column({ type: 'boolean', default: false })
  is_flagged: boolean;

  @Column({ type: 'bigint', default: false })
  created_by: bigint;

  @Column({ nullable: true, type: 'bigint' })
  tenant_id: bigint;
}
