import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { User } from '../../user-administration/user/entity/user.entity';

@Entity()
export class CallCenterSettings {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

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

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant_id: Tenant;
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
