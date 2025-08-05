import { ContentChild, Directive, forwardRef, inject, Input } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { SearchCellDefDirective } from './search-cell-def.directive';
import { SearchColBase } from './search-col-base';
import { SearchColumnAccessor } from '../shared/search-column-accessor';

@Directive({
  selector: '[matColumnDef][stepSearchCol]',
  exportAs: 'SearchCol',
  providers: [
    {
      provide: SearchColumnAccessor,
      useExisting: forwardRef(() => SearchColDirective),
    },
  ],
  standalone: false,
})
export class SearchColDirective extends SearchColBase implements SearchColumnAccessor {
  private _matColumnDef = inject(MatColumnDef, { self: true });

  @Input('stepSearchCol') searchCol?: string;
  @Input() isSearchDisabled?: boolean;

  get searchColumnName(): string {
    return this.searchCol || this._matColumnDef.name;
  }

  @ContentChild(SearchCellDefDirective)
  searchCell?: SearchCellDefDirective;
}
