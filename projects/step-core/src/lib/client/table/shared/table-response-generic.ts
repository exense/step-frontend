import { TableResponseObject } from '../../generated';

export interface TableResponseGeneric<T> extends TableResponseObject {
  data: T[];
  recordsFiltered: number;
  recordsTotal: number;
}
