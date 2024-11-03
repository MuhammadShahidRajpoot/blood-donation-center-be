import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { ResourceSharings } from './resource-sharing.entity';

@Entity()
export class ResourceSharingsFulfillment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(() => ResourceSharings, (resourceSharing) => resourceSharing.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'resource_share_id' })
  resource_share: ResourceSharings;

  @Column({ type: 'int', nullable: false })
  resource_share_id: bigint;

  @Column({ type: 'int', nullable: false })
  share_type_id: bigint;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;
}
