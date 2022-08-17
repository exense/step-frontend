import { FieldSort } from './field-sort';
import { TableRequest, OQLFilter, FieldFilter, FulltextFilter, TableParameters } from '../../generated';

export interface TableRequestData extends TableRequest {
  filters?: (FieldFilter | FulltextFilter | OQLFilter)[];
  sort?: FieldSort;
  skip?: number;
  limit?: number;
  tableParameters?: TableParameters & Record<string, string>;
}
