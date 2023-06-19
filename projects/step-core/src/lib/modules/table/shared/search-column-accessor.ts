import { SearchValue } from './search-value';

export abstract class SearchColumnAccessor {
  abstract readonly searchColumnName: string;
  abstract readonly hasSearchValue: boolean;
  abstract getSearchValue(): SearchValue | undefined;
  abstract search(searchValue: SearchValue): void;
}
