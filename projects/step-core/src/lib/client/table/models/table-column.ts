import { TableSearch } from './table-search';

export interface TableColumn {
  data?: string | number;
  name: string;
  searchable?: boolean;
  orderable?: boolean;
  search?: TableSearch;
}
