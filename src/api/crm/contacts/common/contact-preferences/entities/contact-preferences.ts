import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { PolymorphicType } from '../../../../../common/enums/polymorphic-type.enum';
import { User } from '../../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
@Entity('contact_preferences')
export class ContactPreferences {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ type: 'bigint', nullable: false })
  contact_preferenceable_id: bigint;

  @Column({
    type: 'enum',
    enum: PolymorphicType,
    nullable: true,
    default: PolymorphicType.CRM_CONTACTS_VOLUNTEERS,
  })
  contact_preferenceable_type: PolymorphicType;

  @Column({ type: 'boolean', default: false })
  is_optout_email: boolean;

  @Column({ type: 'boolean', default: false })
  is_optout_sms: boolean;

  @Column({ type: 'boolean', default: false })
  is_optout_push: boolean;

  @Column({ type: 'boolean', default: false })
  is_optout_call: boolean;

  @Column({ nullable: true })
  next_call_date: Date;

  @Column({ default: false, nullable: false })
  is_archived: boolean;

  @Column({ nullable: false, default: new Date() })
  created_at: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;
}
