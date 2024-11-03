import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity('accounts_lists_view')
export class AccountsListView {
  @ViewColumn()
  account_id: bigint;
  @ViewColumn()
  name: string;
  @ViewColumn()
  alternate_name: string;
  @ViewColumn()
  phone: string;
  @ViewColumn()
  website: string;
  @ViewColumn()
  facebook: string;
  @ViewColumn()
  city: string;
  @ViewColumn()
  state: string;
  @ViewColumn()
  county: string;
  @ViewColumn()
  industry_category_id: bigint;
  @ViewColumn()
  industry_category_name: string;
  @ViewColumn()
  industry_subcategory_id: bigint;
  @ViewColumn()
  industry_subcategory_name: string;
  @ViewColumn()
  stage_id: bigint;
  @ViewColumn()
  stage_name: string;
  @ViewColumn()
  source_id: bigint;
  @ViewColumn()
  source_name: string;
  @ViewColumn()
  becs_code: string;
  @ViewColumn()
  collection_operation_id: bigint;
  @ViewColumn()
  collection_operation_name: string;
  @ViewColumn()
  recruiter_id: bigint;
  @ViewColumn()
  recruiter_name: string;
  @ViewColumn()
  territory_id: bigint;
  @ViewColumn()
  territory_name: string;
  @ViewColumn()
  population: number;
  @ViewColumn()
  is_active: boolean;
  @ViewColumn()
  rsmo: boolean;
  @ViewColumn()
  tenant_id: bigint;
  @ViewColumn()
  is_archived: boolean;
}
