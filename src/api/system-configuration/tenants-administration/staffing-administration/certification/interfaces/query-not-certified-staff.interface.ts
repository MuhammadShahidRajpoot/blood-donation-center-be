export interface FilterNotCertifiedStaff {
  status?: boolean;
  co_id?: string;
  team_id?: string;
  role_id?: string;
  certificate_id?: bigint;
}

export interface SortNotCertifiedStaff {
  sortName?: string;
  sortOrder?: 'ASC' | 'DESC';
}
