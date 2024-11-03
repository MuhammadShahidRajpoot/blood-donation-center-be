import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tenant } from '../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { PushNotifications } from './push-notifications.entity';
import { TargetTypeEnum } from '../enums/target-type.enum';

@Entity()
export class TargetNotifications {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(
    () => PushNotifications,
    (push_notification) => push_notification.id,
    { nullable: false }
  )
  @JoinColumn({ name: 'push_notification_id' })
  push_notification: PushNotifications;

  @Column({ type: 'bigint', nullable: true })
  push_notification_id: bigint;

  @Column({ type: 'bigint' })
  target_type_id: bigint;

  @Column({
    type: 'enum',
    enum: TargetTypeEnum,
  })
  target_type: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'int', nullable: false })
  tenant_id: bigint;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
}
