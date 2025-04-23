import { FieldSort } from './field-sort';
import { TableRequest, OQLFilter, FieldFilter, FulltextFilter, TableParameters } from '../../generated';
import { TableCollectionFilter } from './table-collection-filter';

export type TableRequestFilter = FieldFilter | FulltextFilter | OQLFilter | TableCollectionFilter;

export interface TableRequestData extends TableRequest {
  filters?: TableRequestFilter[];
  sort?: FieldSort[];
  skip?: number;
  limit?: number;
  tableParameters?: TableParameters & Record<string, string>;
}
