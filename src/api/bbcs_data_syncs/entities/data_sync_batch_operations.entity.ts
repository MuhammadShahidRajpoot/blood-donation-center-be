import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from '../../common/entities/generic.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { DataSyncOperationTypeEnum } from 'src/api/scheduler/enum/data_sync_operation_type.enum';
import { DataSyncDirectioneEnum } from 'src/api/scheduler/enum/data_sync_direction.enum';
import { ExecutionStatusEnum } from 'src/api/scheduler/enum/execution_status.enum';
@Entity('data_sync_batch_operations')
export class DataSyncBatchOperations extends GenericEntity {
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  job_start: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  job_end: Date;

  @Column({ type: 'varchar', nullable: true })
  next_start: string;

  @Column({ type: 'int', nullable: false })
  inserted_count: number;

  @Column({ type: 'int', nullable: false })
  updated_count: number;

  @Column({ type: 'int', nullable: false })
  total_count: number;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;

  // New columns

  @Column({
    type: 'enum',
    enum: DataSyncOperationTypeEnum,
    default: DataSyncOperationTypeEnum.Donor,
    nullable: false,
  })
  data_sync_operation_type: DataSyncOperationTypeEnum;

  @Column({
    type: 'enum',
    enum: DataSyncDirectioneEnum,
    default: DataSyncDirectioneEnum.BBCS_TO_D37,
    nullable: false,
  })
  sync_direction: DataSyncDirectioneEnum;

  @Column({ type: 'text', nullable: false, default: '' })
  exception: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_failed: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  start_date: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  end_date: Date;

  @Column({ type: 'int', nullable: false })
  attempt: number;

  @Column({
    type: 'enum',
    enum: ExecutionStatusEnum,
    default: ExecutionStatusEnum.NotStarted,
    nullable: false,
  })
  execution_status: ExecutionStatusEnum;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  updated_date: Date;
}
