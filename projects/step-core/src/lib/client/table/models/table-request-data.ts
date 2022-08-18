import { FieldFilter } from './field-filter';
import { FullTextFilter } from './full-text-filter';
import { FieldSort } from './field-sort';
import { TableParameters } from './table-parameters';
import { OQLFilter } from './oql-filter';

export interface TableRequestData {
  filters?: (FieldFilter | FullTextFilter | OQLFilter)[];
  sort?: FieldSort;
  skip?: number;
  limit?: number;
  tableParameters?: TableParameters;
}
