import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity('donors_lists_view')
export class DonorsViewList {
  @ViewColumn()
  donor_id: bigint;

  @ViewColumn()
  donor_number: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  first_name: string;

  @ViewColumn()
  last_name: string;

  @ViewColumn()
  address_city: string;

  @ViewColumn()
  address_state: string;

  @ViewColumn()
  primary_phone: string;

  @ViewColumn()
  address1: string;

  @ViewColumn()
  address2: string;
  @ViewColumn()
  blood_group: string;

  @ViewColumn()
  zip_code: string;

  @ViewColumn()
  primary_email: string;

  @ViewColumn()
  donor_uuid: string;

  @ViewColumn()
  last_donation: Date;

  @ViewColumn()
  donor_updated_at: Date;

  @ViewColumn()
  tenant_id: bigint;

  @ViewColumn()
  group_code_id: bigint;
  @ViewColumn()
  center_code_id: bigint;
  @ViewColumn()
  assertion_code_id: bigint;

  @ViewColumn()
  is_archived: boolean;
}
