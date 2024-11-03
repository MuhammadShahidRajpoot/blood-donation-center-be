import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity('staff_list_view')
export class StaffListView {
  @ViewColumn()
  staff_id: bigint;

  @ViewColumn()
  name: string;

  @ViewColumn()
  first_name: string;

  @ViewColumn()
  last_name: string;

  @ViewColumn()
  birth_date: Date;

  @ViewColumn()
  address_city: string;

  @ViewColumn()
  address_county: string;

  @ViewColumn()
  address_state: string;

  @ViewColumn()
  primary_phone: string;

  @ViewColumn()
  primary_email: string;

  @ViewColumn()
  collection_operation_name: string;

  @ViewColumn()
  classification_name: string;

  @ViewColumn()
  status: boolean;

  @ViewColumn()
  updated_at: Date;

  @ViewColumn()
  contact_uuid: string;

  @ViewColumn()
  tenant_id: bigint;

  @ViewColumn()
  total_calls: bigint;

  @ViewColumn()
  teams: string;

  @ViewColumn()
  roles: string;

  @ViewColumn()
  primary_roles: string;

  @ViewColumn()
  other_roles: string;

  @ViewColumn()
  agent_date: Date;

  @ViewColumn()
  team_ids: bigint;

  @ViewColumn()
  role_ids: bigint;

  @ViewColumn()
  staff_donor_center_facility_ids: bigint;

  @ViewColumn()
  staff_certification_ids: bigint;

  @ViewColumn()
  is_archived: boolean;
}
