import { Entity, Column } from 'typeorm';
import { RequestStatusEnum, RequestTypeEnum } from '../enums/oc-approval.enum';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';
import { String } from 'aws-sdk/clients/appstream';

@Entity('oc_approvals_history')
export class OcApprovalsHistory extends GenericHistoryEntity {
  @Column({ type: 'bigint' })
  operationable_id: number;

  @Column({ type: 'varchar', length: 20 })
  operationable_type: string;

  @Column({
    type: 'text',
  })
  request_type: string;

  @Column({
    type: 'text',
  })
  request_status: string;

  @Column({ type: 'boolean' })
  is_discussion_required: boolean;

  @Column({ nullable: true, type: 'bigint' })
  tenant_id: bigint;
}
