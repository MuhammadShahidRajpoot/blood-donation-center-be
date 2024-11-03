import { Entity, JoinColumn, OneToMany, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity('crm_locations_lists_view')
export class CRMLocationsViewList {
  @ViewColumn()
  id: bigint;

  @ViewColumn()
  cross_street: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  floor: string;

  @ViewColumn()
  room: string;

  @ViewColumn()
  room_phone: string;

  @ViewColumn()
  becs_code: bigint;

  @ViewColumn()
  site_type: string;

  @ViewColumn()
  qualification_status: string;

  @ViewColumn()
  is_active: boolean;
  @ViewColumn()
  created_by: bigint;

  @ViewColumn()
  address: string;

  @ViewColumn()
  site_contact_info: string;

  @ViewColumn()
  qulification_id: string;

  @ViewColumn()
  created_at: Date;

  @ViewColumn()
  tenant_id: bigint;

  @ViewColumn()
  is_archived: boolean;
}
