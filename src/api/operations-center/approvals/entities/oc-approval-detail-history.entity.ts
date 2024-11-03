import { Entity, Column } from 'typeorm';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';
import {
  FieldApprovalStatusEnum,
  FieldEnum,
} from '../enums/oc-approval-detail.enum';

@Entity('oc_approvals_details_history')
export class OcApprovalsDetailHistory extends GenericHistoryEntity {
  @Column({ type: 'bigint' })
  approval_id: number;

  @Column({ type: 'bigint', nullable: true })
  shift_id: number;

  @Column({
    type: 'text',
  })
  field_name: string;

  @Column({
    type: 'text',
  })
  field_approval_status: string;

  @Column({ type: 'boolean' })
  is_override: boolean;

  @Column({ type: 'jsonb' })
  original_data: any;

  @Column({ type: 'jsonb' })
  requested_data: any;
}
