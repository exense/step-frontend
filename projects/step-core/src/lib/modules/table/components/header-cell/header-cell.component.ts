import { Component, forwardRef, inject, Injector, ViewEncapsulation } from '@angular/core';
import { SortHeaderDirective } from '../../directives/sort-header.directive';
import { SearchHeaderDirective } from '../../directives/search-header.directive';
import { ChildFocusStateService } from '../../../basics/step-basics.module';

@Component({
  selector: 'th[step-header-cell]',
  templateUrl: './header-cell.component.html',
  styleUrls: ['./header-cell.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: ChildFocusStateService,
      useExisting: forwardRef(() => HeaderCellComponent),
    },
  ],
})
export class HeaderCellComponent implements ChildFocusStateService {
  protected _injector = inject(Injector);
  protected _sortHeader = inject(SortHeaderDirective, { self: true, optional: true });
  protected _searchHeader = inject(SearchHeaderDirective, { self: true, optional: true });

  protected isInFocus: boolean = false;

  setFocusState(isFocus: boolean): void {
    if (this.isInFocus && !isFocus) {
      setTimeout(() => {
        this.isInFocus = isFocus;
      }, 300);
      return;
    }
    this.isInFocus = isFocus;
  }
}
