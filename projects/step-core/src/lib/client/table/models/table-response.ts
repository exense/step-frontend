import { TableResponseObject } from '../../generated';

export interface TableResponse<T> extends TableResponseObject {
  data: T[];
  recordsFiltered: number;
  recordsTotal: number;
}
