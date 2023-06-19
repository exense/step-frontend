import { Component, ContentChild, forwardRef, inject, Input } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { SearchCellDefDirective } from '../../directives/search-cell-def.directive';
import { SearchColBase } from '../../directives/search-col-base';
import { SearchColumnAccessor } from '../../shared/search-column-accessor';

@Component({
  selector: 'step-search-column',
  templateUrl: './search-column.component.html',
  styleUrls: ['./search-column.component.scss'],
  providers: [
    {
      provide: SearchColumnAccessor,
      useExisting: forwardRef(() => SearchColumnComponent),
    },
  ],
})
export class SearchColumnComponent extends SearchColBase implements SearchColumnAccessor {
  private _matColumnDef = inject(MatColumnDef, { optional: true });

  @Input() name?: string;
  @Input() isSearchDisabled?: boolean;

  get searchColumnName(): string {
    return this.name ?? this._matColumnDef?.name ?? '';
  }

  @ContentChild(SearchCellDefDirective)
  searchCell?: SearchCellDefDirective;

  protected handleClick(event: MouseEvent): void {
    event.stopImmediatePropagation();
  }
}
