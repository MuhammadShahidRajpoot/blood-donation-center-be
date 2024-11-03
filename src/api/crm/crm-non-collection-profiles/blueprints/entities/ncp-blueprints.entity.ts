import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { CrmNonCollectionProfiles } from '../../entities/crm-non-collection-profiles.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity('crm_ncp_blueprints')
export class CrmNcpBluePrints extends GenericEntity {
  @ManyToOne(() => CrmNonCollectionProfiles, (ncp) => ncp.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'crm_non_collection_profiles_id' })
  crm_non_collection_profiles_id: CrmNonCollectionProfiles;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @Column({ type: 'varchar', length: 100, nullable: true })
  blueprint_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  additional_info: string;

  @Column({ type: 'boolean', default: false })
  id_default: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
