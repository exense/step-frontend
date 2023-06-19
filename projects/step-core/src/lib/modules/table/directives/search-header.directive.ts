import { ContentChild, Directive, forwardRef, inject, Input } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { SearchColBase } from './search-col-base';
import { SearchColumnAccessor } from '../shared/search-column-accessor';
import { SearchCellDefDirective } from './search-cell-def.directive';

@Directive({
  selector: 'th[step-header-cell][stepSearchHeader]',
  providers: [
    {
      provide: SearchColumnAccessor,
      useExisting: forwardRef(() => SearchHeaderDirective),
    },
  ],
})
export class SearchHeaderDirective extends SearchColBase implements SearchColumnAccessor {
  private _matColumnDef = inject(MatColumnDef, { optional: true });

  @Input('stepSearchHeader') name?: string;
  @Input() isSearchDisabled?: boolean;
  @Input() isFilterAlwaysVisible?: boolean;

  @ContentChild(SearchCellDefDirective)
  searchCell?: SearchCellDefDirective;

  get searchColumnName(): string {
    return this.name || (this._matColumnDef?.name ?? '');
  }
}
