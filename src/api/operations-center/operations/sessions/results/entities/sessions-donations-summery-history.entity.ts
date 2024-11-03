import { integer } from 'aws-sdk/clients/storagegateway';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DonationsSummery } from './sessions-donation-summery.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';

@Entity('donation_summary_history')
export class DonationsSummeryHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({ type: 'varchar', length: 1 })
  history_reason: string;

  @Column({ type: 'bigint' })
  id: bigint;

  @ManyToOne(() => DonationsSummery, (donationSummery) => donationSummery?.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'id' })
  donationSummery: DonationsSummery;

  @Column({ type: 'bigint' })
  shift_id: bigint;

  @ManyToOne(() => Shifts, (shift) => shift?.id, { nullable: false })
  @JoinColumn({ name: 'shift_id' })
  shift: Shifts;

  @Column({ type: 'bigint' })
  procedure_type_id: bigint;

  @ManyToOne(() => ProcedureTypes, (procedureType) => procedureType?.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'procedure_type_id' })
  procedureType: ProcedureTypes;

  @Column({ type: 'int' })
  procedure_type_qty: integer;

  @Column({ type: 'date' })
  operation_date: Date;

  @Column({ type: 'bigint' })
  operation_id: bigint;

  @Column({ type: 'int' })
  operationable_type: integer;

  @Column({ type: 'int' })
  total_appointments: integer;

  @Column({ type: 'int' })
  registered: integer;

  @Column({ type: 'int' })
  performed: integer;

  @Column({ type: 'int' })
  actual: integer;

  @Column({ type: 'int' })
  deferrals: integer;

  @Column({ type: 'int' })
  qns: integer;

  @Column({ type: 'int' })
  ftd: integer;

  @Column({ type: 'int' })
  walkout: integer;

  @Column({ type: 'timestamp', default: new Date() })
  created_at: Date;

  @Column({ type: 'bigint', nullable: true })
  created_by: integer | null;
}
