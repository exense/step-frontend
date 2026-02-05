import { SearchValue } from '../shared/search-value';
import { Observable } from 'rxjs';

export interface TableSearchParams {
  resetPagination?: boolean;
  isForce?: boolean;
}

export abstract class TableSearch {
  abstract onSearch(column: string, searchValue: SearchValue, params?: TableSearchParams): void;
  abstract onSearch(column: string, value: string, regex?: boolean, params?: TableSearchParams): void;
  abstract getSearchValue$(column: string): Observable<SearchValue | undefined>;
}
