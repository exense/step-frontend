import { AfterViewInit, Directive, inject } from '@angular/core';
import { SearchValue } from '../shared/search-value';
import { TableSearch } from '../services/table-search';
import { SearchColumnAccessor } from '../shared/search-column-accessor';
import { Mutable } from '../../../shared';
import { FilterCondition } from '../shared/filter-condition';

type FieldAccessor = Mutable<Pick<SearchColBase, 'hasSearchValue'>>;

@Directive()
export abstract class SearchColBase implements SearchColumnAccessor, AfterViewInit {
  protected _tableSearch = inject(TableSearch);

  abstract readonly searchColumnName: string;

  readonly hasSearchValue: boolean = false;

  getSearchValue(): SearchValue | undefined {
    return this._tableSearch.getSearchValue(this.searchColumnName);
  }

  ngAfterViewInit(): void {
    this.updateHasSearchValueFlag();
  }

  search(value: string, regex?: boolean): void;
  search(searchValue: SearchValue): void;
  search(value: SearchValue, regex?: boolean): void {
    if (typeof value === 'string') {
      this._tableSearch.onSearch(this.searchColumnName, value, regex);
      this.updateHasSearchValueFlag();
      return;
    }
    this._tableSearch.onSearch(this.searchColumnName, value);
    this.updateHasSearchValueFlag();
  }

  private updateHasSearchValueFlag(): void {
    const searchValue = this.getSearchValue();
    let hasSearchValue: boolean = true;

    if (!searchValue) {
      hasSearchValue = false;
    } else if (searchValue instanceof FilterCondition) {
      hasSearchValue = !searchValue.isEmpty();
    } else if (typeof searchValue === 'object') {
      hasSearchValue = !!searchValue?.value;
    }

    (this as FieldAccessor).hasSearchValue = hasSearchValue;
  }
}
