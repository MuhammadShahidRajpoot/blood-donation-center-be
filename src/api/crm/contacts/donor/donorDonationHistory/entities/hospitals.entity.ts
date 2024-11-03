import { Entity, Column } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';

@Entity('hospitals')
export class Hospitals extends GenericEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  hospital_name: string;
}
