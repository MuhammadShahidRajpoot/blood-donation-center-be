import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tenant } from '../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { GenericEntity } from '../../common/entities/generic.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { PushNotifications } from './push-notifications.entity';
@Entity()
export class UserNotifications {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false })
  user_id: bigint;

  @ManyToOne(
    () => PushNotifications,
    (push_notification) => push_notification.id,
    { nullable: false }
  )
  @JoinColumn({ name: 'push_notification_id' })
  push_notification: PushNotifications;

  @Column({ type: 'bigint', nullable: true })
  push_notification_id: bigint;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'int', nullable: false })
  tenant_id: bigint;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_read: boolean;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
}
