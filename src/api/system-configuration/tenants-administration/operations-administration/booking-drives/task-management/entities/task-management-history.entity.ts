import { Entity, Column } from 'typeorm';
import { OwnerEnum, AppliesToEnum } from '../enums/enums';
import { GenericHistoryEntity } from '../../../../../../common/entities/generic-history.entity';

@Entity('task_history')
export class TaskManagementHistory extends GenericHistoryEntity {
  @Column({ type: 'varchar', length: 60 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  // @Column({
  //   type: 'enum',
  //   enum: OwnerEnum,
  // })
  // owner: OwnerEnum;

  // @Column({
  //   type: 'enum',
  //   enum: AppliesToEnum,
  // })
  // applies_to: AppliesToEnum;

  @Column({
    type: 'text',
    default: OwnerEnum,
  })
  owner: string;

  @Column({
    type: 'text',
    default: AppliesToEnum,
  })
  applies_to: string;

  @Column({ type: 'bigint', nullable: true })
  off_set: bigint;

  @Column()
  collection_operation: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;
}
