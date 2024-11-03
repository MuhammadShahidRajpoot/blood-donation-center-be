import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Segments } from './segments.entity';
import { Tenant } from '../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { User } from '../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
@Entity()
export class SegmentsHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({ type: 'varchar', length: 1, nullable: false })
  history_reason: string;

  @Column({ type: 'bigint', nullable: false })
  id: bigint;

  @ManyToOne(() => Segments, { nullable: false })
  @JoinColumn({ name: 'id' })
  segment: Segments;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'bigint', nullable: false })
  ds_segment_id: bigint;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  segment_type: string;

  @Column({ type: 'int', nullable: false })
  total_members: number;

  @Column({ type: 'timestamp', nullable: false })
  ds_date_created: Date;

  @Column({ type: 'timestamp', nullable: false })
  ds_date_last_modified: Date;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column({ type: 'bigint', nullable: false })
  created_by: bigint;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
