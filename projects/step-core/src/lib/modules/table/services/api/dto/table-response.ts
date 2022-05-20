export type TableResponseItem = [string, null, null];

export interface TableResponse {
  draw: number;
  data: TableResponseItem[];
  recordsFiltered: number;
  recordsTotal: number;
}
