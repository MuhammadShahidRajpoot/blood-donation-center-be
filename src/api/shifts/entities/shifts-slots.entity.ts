import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { GenericEntity } from '../../common/entities/generic.entity';
import { Shifts } from './shifts.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { DonorsAppointments } from 'src/api/crm/contacts/donor/entities/donors-appointments.entity';
import { Donors } from 'src/api/crm/contacts/donor/entities/donors.entity';
import { StaffSetup } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetup.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity()
export class ShiftsSlots extends GenericEntity {
  @ManyToOne(() => Shifts, (shift) => shift.id, { nullable: true })
  @JoinColumn({ name: 'shift_id' })
  shift: Shifts;

  @Column({ type: 'int', nullable: false })
  shift_id: bigint;

  @ManyToOne(() => ProcedureTypes, (procedure_type) => procedure_type.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'procedure_type_id' })
  procedure_type: ProcedureTypes;

  @Column({ type: 'int', nullable: false })
  procedure_type_id: bigint;

  @ManyToOne(() => StaffSetup, (ss) => ss.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'staff_setup_id' })
  staff_setup: StaffSetup;

  @Column({ type: 'int', nullable: false })
  staff_setup_id: bigint;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  start_time: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  end_time: Date;

  @OneToMany(() => DonorsAppointments, (appt) => appt.slot_id, {
    nullable: false,
  })
  appointments: DonorsAppointments;

  @ManyToMany(() => Donors)
  @JoinTable({
    name: 'donors_appointments',
    joinColumn: {
      name: 'slot_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'donor_id',
      referencedColumnName: 'id',
    },
  })
  donors: Donors[];

  @Column({ type: 'int', default: 1 })
  bed: number;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_bbcs_sync: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;
}
