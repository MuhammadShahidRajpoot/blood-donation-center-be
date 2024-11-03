import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('drives_equipments_history')
export class DrivesEquipmentHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({ type: 'varchar', length: 1, nullable: false })
  history_reason: string;

  @Column({ type: 'bigint', nullable: false })
  drive_id: bigint;

  @Column({ type: 'bigint', nullable: false })
  equipment_id: bigint;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column({ type: 'bigint', nullable: false })
  created_by: bigint;
}
