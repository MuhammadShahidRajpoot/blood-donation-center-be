import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CallCenterSettingsHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({ type: 'bigint', nullable: false })
  id: bigint;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column({ type: 'bigint', name: 'created_by' })
  created_by: bigint;

  @Column({ type: 'varchar', length: 1, nullable: false })
  history_reason: string;
  @Column({ nullable: false, type: 'int' })
  calls_per_hour: number;

  @Column({ nullable: false, type: 'int' })
  appointments_per_hour: number;

  @Column({ nullable: false, type: 'int' })
  donors_per_hour: number;

  @Column({ nullable: false, type: 'varchar', length: 50 })
  caller_id_name: string;

  @Column({ nullable: false, type: 'varchar', length: 15 })
  caller_id_number: string;

  @Column({ nullable: false, type: 'varchar', length: 15 })
  callback_number: string;

  @Column({ type: 'int', nullable: false })
  max_calls_per_rolling_30_days: number;

  @Column({ type: 'int', nullable: false })
  max_calls: number;

  @Column({ type: 'bigint', nullable: false })
  busy_call_outcome: bigint;

  @Column({ type: 'bigint', nullable: false })
  no_answer_call_outcome: bigint;

  @Column({ nullable: false, type: 'int' })
  max_retries: number;
  @Column({ nullable: false, type: 'int' })
  max_no_of_rings: number;
  @Column({ nullable: false, type: 'int' })
  tenant_id: bigint;
}
