import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { ShiftsSlots } from 'src/api/shifts/entities/shifts-slots.entity';
import { DateTime } from 'aws-sdk/clients/devicefarm';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { StaffAssignments } from 'src/api/crm/contacts/staff/staffSchedule/entity/self-assignment.entity';

@Entity()
export class StaffAssignmentsDrafts extends GenericEntity {
  @ManyToOne(
    () => StaffAssignments,
    (staffAssignemnts) => staffAssignemnts.id,
    { nullable: true }
  )
  @JoinColumn({ name: 'staff_assignment_id' })
  staff_assignment_id: StaffAssignments;

  @Column({ type: 'varchar', length: 1, nullable: false })
  reason: string;

  @Column({ type: 'bigint', nullable: true })
  operation_id: bigint;

  @Column({ type: 'boolean', nullable: false })
  split_shift: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  operation_type: string;

  @ManyToOne(() => ShiftsSlots, (shiftSlots) => shiftSlots.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'shift_id' })
  shift_id: ShiftsSlots;

  @Column({ type: 'timestamp', precision: 6, nullable: true })
  shift_start_time: DateTime;

  @Column({ type: 'timestamp', precision: 6, nullable: true })
  shift_end_time: DateTime;

  @ManyToOne(() => ContactsRoles, (contactRoles) => contactRoles.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'role_id' })
  role_id: ContactsRoles;

  @ManyToOne(() => Staff, (staff) => staff.id, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff_id: Staff;

  @Column({ type: 'boolean', nullable: true })
  is_additional: boolean;

  @Column({ type: 'int', nullable: true })
  home_base: number;

  @Column({ type: 'boolean', nullable: true })
  is_travel_time_included: boolean;

  @Column({ type: 'boolean', nullable: false })
  pending_assignment: boolean;

  @Column({ type: 'int', nullable: true })
  lead_time: number;

  @Column({ type: 'int', nullable: true })
  travel_to_time: number;

  @Column({ type: 'int', nullable: true })
  setup_time: number;

  @Column({ type: 'int', nullable: true })
  breakdown_time: number;

  @Column({ type: 'int', nullable: true })
  travel_from_time: number;

  @Column({ type: 'int', nullable: true })
  wrapup_time: number;

  @Column({ type: 'timestamp', precision: 6, nullable: true })
  clock_in_time: Date;

  @Column({ type: 'timestamp', precision: 6, nullable: true })
  clock_out_time: Date;

  @Column({ type: 'decimal', nullable: true })
  total_hours: number;

  @Column({ type: 'decimal', nullable: true })
  reassign_by: number;

  @Column({ type: 'boolean', nullable: false })
  is_notify: boolean;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;
}
