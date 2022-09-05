import { TableResponse } from '../../generated';

export interface TableResponseGeneric<T> extends TableResponse {
  data: T[];
  recordsFiltered: number;
  recordsTotal: number;
}
