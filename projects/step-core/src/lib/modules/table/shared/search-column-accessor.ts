import { SearchValue } from './search-value';

export abstract class SearchColumnAccessor {
  abstract readonly searchColumnName: string;
  abstract getSearchValue(): SearchValue | undefined;
  abstract search(searchValue: SearchValue): void;
}
