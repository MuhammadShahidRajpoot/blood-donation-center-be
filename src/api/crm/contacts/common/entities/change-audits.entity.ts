import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { OperationTypeEnum } from 'src/api/call-center/call-schedule/call-jobs/enums/operation-type.enum';

@Entity('change_audits')
export class ChangeAudits extends GenericEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  changes_from: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  changes_to: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  changes_field: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  changed_when: string;

  @Column({
    type: 'enum',
    enum: OperationTypeEnum,
    nullable: false,
  })
  auditable_type: OperationTypeEnum;

  @Column({ nullable: false, type: 'bigint' })
  auditable_id: bigint;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;
}
