import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from '../../../../../common/entities/generic.entity';
import { Tenant } from '../../../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { LeavesTypes } from 'src/api/system-configuration/staffing-administration/leave-type/entities/leave-types.entity';

@Entity()
export class StaffLeave extends GenericEntity {
  @ManyToOne(() => Staff, (staff) => staff.id, { nullable: false })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ type: 'bigint' })
  staff_id: bigint;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;

  @ManyToOne(() => LeavesTypes, (type) => type.id, { nullable: false })
  @JoinColumn({ name: 'type_id' })
  type: LeavesTypes;

  @Column({ type: 'bigint', nullable: false })
  type_id: bigint;

  @Column({ type: 'date' })
  begin_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'double precision' })
  hours: number;

  @Column({ type: 'text' })
  note: string;
}
