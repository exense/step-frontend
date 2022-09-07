import { ContentChild, Directive, Input, Self } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { SearchCellDefDirective } from './search-cell-def.directive';
import { TableSearch } from '../services/table-search';
import { SearchValue } from '../shared/search-value';

@Directive({
  selector: '[matColumnDef][stepSearchCol]',
  exportAs: 'SearchCol',
})
export class SearchColDirective {
  constructor(@Self() private _matColumnDef: MatColumnDef, private _tableSearch: TableSearch) {}

  @Input('stepSearchCol') searchCol?: string;
  @Input() isSearchDisabled?: boolean;

  get searchColumnName(): string {
    return this.searchCol || this._matColumnDef.name;
  }

  @ContentChild(SearchCellDefDirective)
  searchCell?: SearchCellDefDirective;

  search(value: string, regex?: boolean): void;
  search(searchValue: SearchValue): void;
  search(value: SearchValue, regex?: boolean): void {
    if (typeof value === 'string') {
      this._tableSearch.onSearch(this.searchColumnName, value, regex);
    }
    this._tableSearch.onSearch(this.searchColumnName, value);
  }
}
