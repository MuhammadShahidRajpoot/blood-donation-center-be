import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { Notifications } from './notifications.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';

@Entity()
export class NotificationsStaff {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @OneToOne(() => Notifications, (notification) => notification.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'notification_id' })
  notification_id: bigint;

  @ManyToOne(() => Staff, (staff) => staff.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'staff_id' })
  staff_id: bigint;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant_id: bigint;
}
