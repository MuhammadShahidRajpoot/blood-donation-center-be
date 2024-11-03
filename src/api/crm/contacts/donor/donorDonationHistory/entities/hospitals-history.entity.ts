import { Entity, Column } from 'typeorm';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';

@Entity('hospitals_history')
export class HospitalsHistory extends GenericHistoryEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  hospital_name: string;
}
