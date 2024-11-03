import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity('donor_duplicates_list_view')
export class DonorDuplicatesListView {
  @ViewColumn()
  record_id: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  first_name: string;

  @ViewColumn()
  last_name: string;

  @ViewColumn()
  address: string;

  @ViewColumn()
  city: string;

  @ViewColumn()
  primary_phone: string;

  @ViewColumn()
  primary_email: string;

  @ViewColumn()
  status: boolean;

  @ViewColumn()
  duplicatable_id: number;

  @ViewColumn()
  duplicatable_type: string;

  @ViewColumn()
  is_resolved: boolean;

  @ViewColumn()
  tenant_id: number;

  @ViewColumn()
  is_archived: boolean;
}
