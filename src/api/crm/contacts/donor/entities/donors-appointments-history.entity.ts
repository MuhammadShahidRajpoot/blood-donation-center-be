import { Entity, Column } from 'typeorm';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';

@Entity('donors_appointments_history')
export class DonorsAppointmentsHistory extends GenericHistoryEntity {
  @Column({ type: 'bigint', nullable: false })
  appointmentable_id: bigint;

  @Column({ type: 'varchar', length: 255, nullable: false })
  appointmentable_type: string;

  @Column({ type: 'bigint', nullable: true })
  donor_id: bigint;

  @Column({ type: 'bigint', nullable: true })
  slot_id: bigint;

  @Column({ type: 'bigint', nullable: true })
  procedure_type_id: bigint;

  @Column({ type: 'varchar', length: 60, nullable: false })
  status: string;

  @Column({ nullable: true, type: 'bigint' })
  tenant_id: bigint;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_bbcs_sync: boolean;
}
