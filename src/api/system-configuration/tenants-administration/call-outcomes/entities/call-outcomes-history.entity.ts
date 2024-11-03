import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ColorCodeEnum } from '../enums/call-outcomes.enum';

@Entity('call_outcomes_history')
export class CallOutcomesHistory {
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

  @Column({ nullable: false, type: 'varchar', length: 50 })
  name: string;

  @Column({ nullable: false, type: 'varchar', length: 50 })
  code: string;

  @Column({ nullable: false, type: 'int' })
  next_call_interval: number;

  // @Column({
  //   type: 'enum',
  //   enum: ColorCodeEnum,
  //   nullable: true,
  // })
  // color: ColorCodeEnum;

  @Column({
    type: 'text',
    default: ColorCodeEnum,
    nullable: true,
  })
  type: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_archived: boolean;

  @Column({ default: false })
  is_default: boolean;

  @Column({ nullable: false, type: 'int' })
  tenant_id: bigint;
}
