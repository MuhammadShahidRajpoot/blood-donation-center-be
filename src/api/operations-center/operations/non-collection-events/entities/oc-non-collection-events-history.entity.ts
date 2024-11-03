import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';
import { ApprovalStatusEnum } from '../../drives/enums';

@Entity('oc_non_collection_events_history')
export class NonCollectionEventsHistory extends GenericHistoryEntity {
  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column({ type: 'varchar', nullable: false })
  event_name: string;

  @Column({ type: 'bigint', nullable: false })
  owner_id: bigint;

  @Column({ type: 'bigint', nullable: false })
  non_collection_profile_id: bigint;

  @Column({ type: 'bigint', nullable: false })
  location_id: bigint;

  @Column({
    type: 'text',
    nullable: false,
  })
  approval_status: string;

  @Column({ type: 'bigint', nullable: false })
  status_id: bigint;

  @Column({ type: 'bigint', nullable: false })
  event_category_id: bigint;

  @Column({ type: 'bigint', nullable: true })
  event_subcategory_id: bigint;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;
}
