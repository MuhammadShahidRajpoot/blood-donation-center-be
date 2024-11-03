import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import {
  FavoriteCalendarPreviewTypeEnum,
  FavoriteLocationTypeEnum,
  FavoriteOperationTypeEnum,
} from '../enum/manage-favorites.enum';
import { Products } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/products/entities/products.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { FavoritesOrganizationalLevels } from 'src/api/operations-center/manage-favorites/entities/favorites-org-levels.entity';

@Entity('favorites')
export class Favorites extends GenericEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  alternate_name: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @ManyToOne(() => Products, (product) => product.id, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product_id: Products;

  @ManyToOne(() => ProcedureTypes, (procedureTypes) => procedureTypes.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'procedure_type_id' })
  procedure_type_id: ProcedureTypes;

  @ManyToOne(() => OperationsStatus, (operationStatus) => operationStatus.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'operations_status_id' })
  operations_status_id: OperationsStatus;

  @Column({
    type: 'enum',
    enum: FavoriteCalendarPreviewTypeEnum,
    default: FavoriteCalendarPreviewTypeEnum.Month,
  })
  preview_in_calendar: FavoriteCalendarPreviewTypeEnum;

  @Column({
    type: 'enum',
    enum: FavoriteLocationTypeEnum,
  })
  location_type: FavoriteLocationTypeEnum;

  @Column({
    type: 'enum',
    enum: FavoriteOperationTypeEnum,
  })
  operation_type: FavoriteOperationTypeEnum;

  @Column({ type: 'bool', nullable: true, default: true })
  status: boolean;

  @Column({ type: 'bool', nullable: true, default: false })
  is_default: boolean;

  @Column({ type: 'bool', nullable: true })
  is_open_in_new_tab: boolean;

  @Column({ type: 'text', nullable: false })
  bu_metadata: string;

  @OneToMany(() => FavoritesOrganizationalLevels, (ol) => ol.favorite_id, {
    nullable: false,
  })
  @JoinColumn({ name: 'favorite_id' })
  organizational_levels: FavoritesOrganizationalLevels;
}
