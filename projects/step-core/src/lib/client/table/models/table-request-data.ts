import { FieldFilter } from './field-filter';
import { FullTextFilter } from './full-text-filter';
import { FieldSort } from './field-sort';
import { TableParameters } from './table-parameters';

export interface TableRequestData {
  filters?: (FieldFilter | FullTextFilter)[];
  sort?: FieldSort;
  start?: number;
  length?: number;
  tableParameters?: TableParameters;
}
