import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { CloseDate } from './close-date.entity';
import { BusinessUnits } from '../../../../organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { GenericEntity } from 'src/api/common/entities/generic.entity';

@Entity('close_date_collection_operations')
export class CloseDateCollectionOperation extends GenericEntity {
  @ManyToOne(() => CloseDate, (close_dates) => close_dates.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'close_date_id' })
  close_date_id: bigint;

  @ManyToOne(() => BusinessUnits, (businessUnit) => businessUnit.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'collection_operation_id' })
  collection_operation_id: BusinessUnits | bigint;

  @Column({ type: 'bigint', nullable: true })
  tenant_id?: number;
}
