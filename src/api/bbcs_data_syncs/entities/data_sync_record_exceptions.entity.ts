import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from '../../common/entities/generic.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { DataSyncOperationTypeEnum } from 'src/api/scheduler/enum/data_sync_operation_type.enum';
import { DataSyncDirectioneEnum } from 'src/api/scheduler/enum/data_sync_direction.enum';

@Entity('data_sync_record_exceptions')
export class DataSyncRecordExceptions extends GenericEntity {
  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;

  @Column({ type: 'varchar', nullable: true })
  datasyncable_id: string;

  @Column({
    type: 'enum',
    enum: DataSyncOperationTypeEnum,
    default: DataSyncOperationTypeEnum.Donor,
    nullable: false,
  })
  datasyncable_type: DataSyncOperationTypeEnum;

  @Column({
    type: 'enum',
    enum: DataSyncDirectioneEnum,
    default: DataSyncDirectioneEnum.BBCS_TO_D37,
    nullable: false,
  })
  sync_direction: DataSyncDirectioneEnum;

  @Column({ type: 'text', nullable: false, default: '' })
  exception: string;

  @Column({ type: 'int', nullable: false })
  attempt: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_deleted: boolean;
}
