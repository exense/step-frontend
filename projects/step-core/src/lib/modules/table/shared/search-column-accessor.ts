import { SearchValue } from './search-value';
import { Observable } from 'rxjs';

export abstract class SearchColumnAccessor {
  abstract readonly searchColumnName: string;
  abstract getSearchValue$(): Observable<SearchValue | undefined>;
  abstract search(searchValue: SearchValue): void;
}
