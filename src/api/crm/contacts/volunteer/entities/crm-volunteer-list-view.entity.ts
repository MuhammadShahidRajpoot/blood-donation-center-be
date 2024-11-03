import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity('volunteers_list_view')
export class VolunteerListView {
  @ViewColumn()
  volunteer_id: bigint;

  @ViewColumn()
  tenant_id: bigint;

  @ViewColumn()
  nick_name: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  first_name: string;

  @ViewColumn()
  last_name: string;

  @ViewColumn()
  birth_date: Date;

  @ViewColumn()
  status: boolean;

  @ViewColumn()
  address_city: string;

  @ViewColumn()
  address_state: string;

  @ViewColumn()
  address_county: string;

  @ViewColumn()
  primary_phone: string;

  @ViewColumn()
  primary_email: string;

  @ViewColumn()
  is_archived: boolean;

  @ViewColumn()
  updated_at: Date;

  @ViewColumn()
  contact_uuid: string;

  @ViewColumn()
  created_by: bigint;
}
