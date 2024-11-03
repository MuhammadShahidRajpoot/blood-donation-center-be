import { Entity, Column, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { GenericEntity } from '../../common/entities/generic.entity';
import { Shifts } from './shifts.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { StaffSetup } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetup.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity('shifts_projections_staff')
export class ShiftsProjectionsStaff {
  @ManyToOne(() => Shifts, (shift) => shift.id, { nullable: true })
  @JoinColumn({ name: 'shift_id' })
  shift: Shifts;

  @PrimaryColumn({ type: 'bigint', nullable: false })
  shift_id: bigint;

  @ManyToOne(() => ProcedureTypes, (procedure_type) => procedure_type.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'procedure_type_id' })
  procedure_type: ProcedureTypes;

  @PrimaryColumn({ type: 'bigint', nullable: false })
  procedure_type_id: bigint;

  @Column({ type: 'float', nullable: false })
  procedure_type_qty: number;

  @ManyToOne(() => StaffSetup, (staff_setup) => staff_setup.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'staff_setup_id' })
  staff_setup: StaffSetup;

  @PrimaryColumn({ type: 'bigint', nullable: false })
  staff_setup_id: bigint;

  @Column({ type: 'float', nullable: false })
  product_yield: number;

  @Column({ type: 'boolean', default: true })
  is_donor_portal_enabled: boolean;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;
}
