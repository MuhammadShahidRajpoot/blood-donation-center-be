import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';

@Entity()
export class ShiftsProjectionsStaffHistory {
  @Column({ type: 'int', nullable: false })
  shift_id: bigint;

  @Column({ type: 'int', nullable: false })
  procedure_type_id: bigint;

  @Column({ type: 'float', nullable: false })
  procedure_type_qty: number;

  @Column({ type: 'int', nullable: false })
  staff_setup_id: bigint;

  @Column({ type: 'float', nullable: false })
  product_yield: number;

  @PrimaryGeneratedColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @Column({ type: 'bigint', name: 'created_by' })
  created_by: bigint;

  @Column({ type: 'varchar', length: 1, nullable: false })
  history_reason: string;
}
