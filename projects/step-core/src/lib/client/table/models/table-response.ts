export interface TableResponse<T> {
  data: T[];
  recordsFiltered: number;
  recordsTotal: number;
}
