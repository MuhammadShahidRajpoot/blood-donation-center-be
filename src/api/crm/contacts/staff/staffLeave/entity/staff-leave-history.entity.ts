import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericHistoryEntity } from '../../../../../common/entities/generic-history.entity';
import { LeavesTypes } from 'src/api/system-configuration/staffing-administration/leave-type/entities/leave-types.entity';

@Entity()
export class StaffLeaveHistory extends GenericHistoryEntity {
  @Column({ type: 'bigint' })
  staff_id: bigint;

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
