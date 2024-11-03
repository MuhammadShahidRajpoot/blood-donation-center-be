import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
@Entity('assertion')
export class Assertion {
  @PrimaryGeneratedColumn()
  id: bigint;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 20 })
  code: string;

  @Column({ length: 500 })
  description: string;

  @Column({ nullable: true })
  is_expired: boolean;

  @Column()
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: bigint;

  @Column({ nullable: false, default: new Date() })
  created_at: Date;

  @Column({ nullable: true })
  expiration_months: number;

  @Column()
  bbcs_uuid: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;
}
