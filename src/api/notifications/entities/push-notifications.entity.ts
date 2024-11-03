import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Tenant } from '../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { GenericEntity } from '../../common/entities/generic.entity';

@Entity('push_notifications')
export class PushNotifications extends GenericEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  organizational_level: bigint[];

  @Column({ type: 'varchar', nullable: true })
  module: bigint[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  actionable_link: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'int', nullable: false })
  tenant_id: bigint;
}
