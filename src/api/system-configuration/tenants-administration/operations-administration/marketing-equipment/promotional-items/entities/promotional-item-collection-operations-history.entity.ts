import { User } from '../../../../user-administration/user/entity/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PromotionalItems } from './promotional-item.entity';
import { BusinessUnits } from '../../../../organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';

@Entity('promotionalItem_collection_operations_history')
export class PromotionalItemCollectionOperationHistory extends GenericHistoryEntity {
  @ManyToOne(
    () => PromotionalItems,
    (PromotionalItems) => PromotionalItems.id,
    { nullable: false }
  )
  @JoinColumn({ name: 'promotional_item_id' })
  promotional_item_id: bigint;

  @ManyToOne(() => BusinessUnits, (businessUnit) => businessUnit.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'collection_operation_id' })
  collection_operation_id: bigint;
}
