import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { RequestStatusEnum, RequestTypeEnum } from '../enums/oc-approval.enum';
import { OcApprovalsDetail } from './oc-approval-detail.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity('oc_approvals')
export class OcApprovals extends GenericEntity {
  @Column({ type: 'bigint' })
  operationable_id: bigint;

  @Column({ type: 'varchar', length: 20 })
  operationable_type: string;

  @Column({
    type: 'enum',
    enum: RequestTypeEnum,
  })
  request_type: RequestTypeEnum;

  @Column({
    type: 'enum',
    enum: RequestStatusEnum,
  })
  request_status: RequestStatusEnum;

  @Column({ type: 'boolean' })
  is_discussion_required: boolean;

  @OneToMany(
    () => OcApprovalsDetail,
    (ocApprovalsDetail) => ocApprovalsDetail.approval
  )
  details?: OcApprovalsDetail[];

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: true, type: 'bigint' })
  tenant_id: bigint;
}
