import { Entity, Column } from 'typeorm';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';

@Entity('favorites_org_levels_history')
export class FavoritesOrganizationalLevelsHistory extends GenericHistoryEntity {
  @Column({ type: 'bigint', name: 'favorite_id', nullable: false })
  favorite_id: bigint;

  @Column({ type: 'bigint', name: 'organization_level_id', nullable: false })
  organization_level_id: bigint;

  @Column({ type: 'bigint', name: 'tenant_id', nullable: false })
  tenant_id: bigint;

  @Column({ type: 'boolean', default: true, nullable: true })
  is_active: boolean;
}
