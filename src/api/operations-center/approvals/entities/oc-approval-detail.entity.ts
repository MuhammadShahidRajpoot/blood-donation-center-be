import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { OcApprovals } from './oc-approval.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import {
  FieldApprovalStatusEnum,
  FieldEnum,
} from '../enums/oc-approval-detail.enum';

@Entity('oc_approvals_details')
export class OcApprovalsDetail extends GenericEntity {
  @Column({ type: 'bigint' })
  approval_id: number;

  @Column({ type: 'bigint', nullable: true })
  shift_id: number;

  @Column({
    type: 'enum',
    enum: FieldEnum,
  })
  field_name: FieldEnum;

  @Column({
    type: 'enum',
    enum: FieldApprovalStatusEnum,
  })
  field_approval_status: FieldApprovalStatusEnum;

  @Column({ type: 'boolean' })
  is_override: boolean;

  @Column({ type: 'jsonb' })
  original_data: any;

  @Column({ type: 'jsonb' })
  requested_data: any;

  @ManyToOne(() => OcApprovals)
  @JoinColumn({ name: 'approval_id' })
  approval: OcApprovals;

  @ManyToOne(() => Shifts)
  @JoinColumn({ name: 'shift_id' })
  shift: Shifts;
}
