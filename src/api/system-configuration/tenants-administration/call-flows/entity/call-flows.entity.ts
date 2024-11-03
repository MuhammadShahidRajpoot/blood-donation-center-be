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
@Entity('call_flows')
export class CallFlowsEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;
  @Column({ nullable: false, type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: callFlows,
  })
  caller_answer_call: callFlows;

  @Column({
    type: 'enum',
    enum: callFlows,
  })
  vmbox_detected: callFlows;
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

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;
}
