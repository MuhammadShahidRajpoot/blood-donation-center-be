export class SharedStaffDto {
  id: number;
  first_name: string;
  last_name: string;
  collection_operation: number;
  teams: [];
  schedule_dates: [];
  assigned_hours: number;
  target_hours: number;
  tenant_id: number;
  is_certified: boolean;
  is_certificate_expired: boolean;
}
