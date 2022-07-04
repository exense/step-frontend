import { TableColumn } from './table-column';
import { ColumnOrder } from './column-order';
import { TableSearch } from './table-search';

export interface TableRequestData {
  draw: number;
  columns: TableColumn[];
  order: ColumnOrder[];
  start: number;
  length: number;
  search: TableSearch;
  filter?: string;
}
