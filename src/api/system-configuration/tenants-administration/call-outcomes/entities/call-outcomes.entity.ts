import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { User } from '../../user-administration/user/entity/user.entity';
import { ColorCodeEnum } from '../enums/call-outcomes.enum';

@Entity('call_outcomes')
export class CallOutcomes {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ nullable: false, type: 'varchar', length: 50 })
  name: string;

  @Column({ nullable: false, type: 'varchar', length: 50 })
  code: string;

  @Column({ nullable: false, type: 'int' })
  next_call_interval: number;

  @Column({
    type: 'enum',
    enum: ColorCodeEnum,
    nullable: true,
  })
  color: ColorCodeEnum;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_archived: boolean;

  @Column({ default: false })
  is_default: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;

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
