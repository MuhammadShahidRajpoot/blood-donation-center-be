import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { enumType } from '../enum/ads.enum';
import { Tenant } from '../../../../../platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity()
export class Ads {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ nullable: false })
  image_name: string;

  @Column({ nullable: false })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  redirect_url: string;

  @Column({ nullable: true })
  display_order: number;

  @Column({
    type: 'enum',
    enum: enumType,
    nullable: false,
  }) // define enum for type
  ad_type: enumType;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_archive: boolean;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: bigint;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @Column({ nullable: false, default: new Date() })
  created_at: Date;

  // @UpdateDateColumn({ nullable: false, type: 'timestamp' })
  // updated_at: Date;
}
