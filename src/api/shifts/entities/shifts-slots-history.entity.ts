import { Entity, Column } from 'typeorm';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';

@Entity()
export class ShiftsSlotsHistory extends GenericHistoryEntity {
  @Column({ type: 'int', nullable: false })
  shift_id: bigint;

  @Column({ type: 'int', nullable: false })
  procedure_type_id: bigint;

  @Column({ type: 'int', nullable: false })
  staff_setup_id: bigint;

  @Column({
    type: 'date',
    nullable: true,
  })
  start_time: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  end_time: Date;

  @Column({ type: 'int', default: 1 })
  bed: number;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_bbcs_sync: boolean;
}
