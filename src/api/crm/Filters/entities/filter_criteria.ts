import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
// import { GenericEntity } from "../../../common/entities/generic.entity";
import { GenericEntity } from '../../../common/entities/generic.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity('filter_criteria')
export class FilterCriteria extends GenericEntity {
  @Column({ type: 'varchar', length: 60, nullable: false })
  application_code: string;

  @Column({ type: 'bigint', nullable: false })
  code: bigint;

  @Column({ type: 'varchar', length: 60, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  display_name: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  display_order: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  criteria_type: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: true, type: 'bigint' })
  tenant_id: bigint;
}
