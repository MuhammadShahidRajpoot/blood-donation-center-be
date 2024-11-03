import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity('facility_list_view')
export class FacilityViewList {
  @ViewColumn()
  id: bigint;

  @ViewColumn()
  name: string;

  @ViewColumn()
  alternate_name: string;

  @ViewColumn()
  phone: string;

  @ViewColumn()
  code: string;

  @ViewColumn()
  donor_center: boolean;

  @ViewColumn()
  staging_site: boolean;

  @ViewColumn()
  collection_operation_id: bigint;

  @ViewColumn()
  status: boolean;

  @ViewColumn()
  tenant_id: bigint;

  @ViewColumn()
  industry_category_id: bigint;

  @ViewColumn()
  industry_category: string;

  @ViewColumn()
  industry_sub_category: string;

  @ViewColumn()
  minimum_oef: number;

  @ViewColumn()
  maximum_oef: number;

  @ViewColumn()
  is_archived: boolean;

  @ViewColumn()
  collection_operation: string;

  @ViewColumn()
  city: string;

  @ViewColumn()
  state: string;

  @ViewColumn()
  county: string;

  @ViewColumn()
  zip_code: string;

  @ViewColumn()
  physical_address: string;
}
