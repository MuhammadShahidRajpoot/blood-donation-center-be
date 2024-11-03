export interface FilterStaffLeave {
  staff_id: bigint;
  type_id?: bigint;
  begin_date?: Date;
  end_date?: Date;
  period?: string;
}
