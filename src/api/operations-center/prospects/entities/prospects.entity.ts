import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { ProspectsCommunications } from './prospects-communications.entity';
import { ProspectsFilters } from './prospects-filters.entity';
import { ProspectsBlueprints } from './prospects-blueprints.entity';

@Entity('prospects')
export class Prospects extends GenericEntity {
  @Column({ type: 'varchar', length: 60, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  description: string;

  @Column({ type: 'boolean', default: true, nullable: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  ds_sync: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;

  @Column({ nullable: false, default: new Date() })
  updated_at: Date;

  @OneToOne(
    () => ProspectsCommunications,
    (communication) => communication.prospect_id
  )
  communications: ProspectsCommunications[];

  @OneToOne(() => ProspectsFilters, (filters) => filters.prospect_id)
  filters: ProspectsFilters[];

  @OneToMany(() => ProspectsBlueprints, (blueprints) => blueprints.prospect_id)
  blueprints: ProspectsBlueprints[];
}
