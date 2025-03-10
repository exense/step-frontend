import { SearchValue } from '../shared/search-value';
import { Observable } from 'rxjs';

export abstract class TableSearch {
  abstract onSearch(column: string, searchValue: SearchValue, resetPagination?: boolean): void;
  abstract onSearch(column: string, value: string, regex?: boolean, resetPagination?: boolean): void;
  abstract getSearchValue$(column: string): Observable<SearchValue | undefined>;
}
