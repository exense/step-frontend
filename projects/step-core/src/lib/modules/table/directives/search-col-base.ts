import { Directive, inject } from '@angular/core';
import { SearchValue } from '../shared/search-value';
import { TableSearch } from '../services/table-search';
import { SearchColumnAccessor } from '../shared/search-column-accessor';
import { Observable } from 'rxjs';

@Directive()
export abstract class SearchColBase implements SearchColumnAccessor {
  protected _tableSearch = inject(TableSearch);

  abstract readonly searchColumnName: string;

  getSearchValue$(): Observable<SearchValue | undefined> {
    return this._tableSearch.getSearchValue$(this.searchColumnName);
  }

  search(value: string, regex?: boolean): void;
  search(searchValue: SearchValue): void;
  search(value: SearchValue, regex?: boolean): void {
    if (typeof value === 'string') {
      this._tableSearch.onSearch(this.searchColumnName, value, regex);
      return;
    }
    this._tableSearch.onSearch(this.searchColumnName, value);
  }
}
