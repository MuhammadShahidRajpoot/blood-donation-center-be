import { User } from '../../../../user-administration/user/entity/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EquipmentEntity } from './equipment.entity';
import { BusinessUnits } from '../../../../organizational-administration/hierarchy/business-units/entities/business-units.entity';

@Entity('equipments_collection_operations')
export class EquipmentCollectionOperationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(() => EquipmentEntity, (equipment) => equipment.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'equipment_id' })
  equipment_id: bigint;

  @ManyToOne(() => BusinessUnits, (businessUnit) => businessUnit.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'collection_operation_id' })
  collection_operation_id: BusinessUnits | bigint;

  @Column({ nullable: false })
  collection_operation_name: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: bigint;

  @Column({ type: 'bigint', nullable: true })
  tenant_id?: number;

  @Column({ nullable: false, default: new Date() })
  created_at: Date;
}
