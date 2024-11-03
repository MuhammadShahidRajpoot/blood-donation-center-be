import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { GenericEntity } from '../../../../common/entities/generic.entity';
import { Drives } from './drives.entity';
import { EquipmentEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/manage-equipment/equipment/entity/equipment.entity';

enum typeEnum {
  'DRIVE' = 'DRIVE',
  'SESSION' = 'SESSION',
}

@Entity('pickups')
export class Pickups extends GenericEntity {
  @Column({ type: 'bigint', nullable: false })
  pickable_id: bigint;

  @ManyToOne(() => EquipmentEntity, (equipment) => equipment.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'equipment_id' })
  equipment_id: bigint;

  @Column({
    type: 'enum',
    enum: typeEnum,
    nullable: true,
    default: typeEnum.DRIVE,
  })
  pickable_type: typeEnum;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  start_time: Date;

  @Column({ type: 'text', nullable: true })
  description: string;
}
