import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { ScheduleJobDetails } from './schedule_job_details.entity';
import { ScheduleBaseOnEnum } from '../enum/schedule_base_on.enum';

@Entity('schedule_job_configuration')
export class ScheduleJobConfiguration extends GenericEntity {
  @Column({
    type: 'enum',
    enum: ScheduleBaseOnEnum,
    default: ScheduleBaseOnEnum.Daily,
  })
  schedule_base_on: ScheduleBaseOnEnum;

  @Column({ type: 'timestamp', precision: 6, nullable: false })
  schedule_time: Date;

  @Column({ type: 'boolean', nullable: false })
  is_active: boolean;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  job_id: bigint;

  @ManyToOne(() => ScheduleJobDetails, (job) => job.id, { nullable: false })
  @JoinColumn({ name: 'job_id' })
  job: ScheduleJobDetails;
}
