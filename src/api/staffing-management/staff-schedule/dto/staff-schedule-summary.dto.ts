export class StaffScheduleSummaryDto {
  operations: OperationSummaryDto;
  staff: StaffSummaryDto;
  efficiency: EfficiencyDto;
  tenant_id: number;
}

export class OperationSummaryDto {
  total_operations: number;
  fully_staffed: number;
  status_exclutions: number;
  overstaffed: number;
  tenant_id: number;
}

export class StaffSummaryDto {
  total_staff: number;
  under_minimum_hours: number;
  staff_in_overtime: number;
  average_overtime: number;
  tenant_id: number;
}

export class EfficiencyDto {
  include_travel_procedures_per_hour: number; //Procedure percentage
  exclude_travel_procedures_per_hour: number; //Procedure percentage
  include_travel_products_per_hour: number; //Product percentage
  exclude_travel_products_per_hour: number; //Product percentage
  tenant_id: number;
}
