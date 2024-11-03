import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';

import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { Favorites } from './favorites.entity';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { OrganizationalLevels } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/organizational-levels/entities/organizational-level.entity';

@Entity('favorites_org_levels')
export class FavoritesOrganizationalLevels extends GenericEntity {
  @ManyToOne(() => Favorites, (favorites) => favorites.id, { nullable: false })
  @JoinColumn({ name: 'favorite_id' })
  favorite_id: Favorites;

  @ManyToOne(
    () => OrganizationalLevels,
    (OrganizationalLevels) => OrganizationalLevels.id,
    { nullable: false }
  )
  @JoinColumn({ name: 'organization_level_id' })
  organization_level_id: OrganizationalLevels;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @Column({ type: 'boolean', default: true, nullable: true })
  is_active: boolean;
}
