import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { callFlows } from '../enums/callFlows.enum';
import { User } from '../../user-administration/user/entity/user.entity';
@Entity('call_flows_history')
export class CallFlowsEntityHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({ type: 'varchar', length: 1, nullable: false })
  history_reason: string;

  @Column({ type: 'bigint', nullable: false })
  id: bigint;

  @Column({ nullable: false, type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  caller_answer_call: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  vmbox_detected: string;

  @Column({ nullable: false })
  is_default: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_archived: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: number;

  @UpdateDateColumn({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;
}
