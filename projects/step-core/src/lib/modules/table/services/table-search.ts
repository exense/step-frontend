import { SearchValue } from '../shared/search-value';
import { Observable } from 'rxjs';

export abstract class TableSearch {
  abstract onSearch(column: string, searchValue: SearchValue): void;
  abstract onSearch(column: string, value: string, regex?: boolean): void;
  abstract getSearchValue$(column: string): Observable<SearchValue | undefined>;
}
