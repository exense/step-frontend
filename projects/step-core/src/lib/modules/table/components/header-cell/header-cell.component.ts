import { Component, forwardRef, inject, Injector, OnDestroy, ViewEncapsulation } from '@angular/core';
import { SortHeaderDirective } from '../../directives/sort-header.directive';
import { SearchHeaderDirective } from '../../directives/search-header.directive';
import { ChildFocusStateService } from '../../../basics/step-basics.module';
import { Subject, takeUntil, timer } from 'rxjs';

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
export class HeaderCellComponent implements ChildFocusStateService, OnDestroy {
  private preventLostFocus$ = new Subject<void>();

  protected _injector = inject(Injector);
  protected _sortHeader = inject(SortHeaderDirective, { self: true, optional: true });
  protected _searchHeader = inject(SearchHeaderDirective, { self: true, optional: true });

  protected isInFocus: boolean = false;

  ngOnDestroy(): void {
    this.preventLostFocus$.complete();
  }

  setFocusState(isFocus: boolean): void {
    if (isFocus) {
      this.preventLostFocus$.next();
    }
    if (this.isInFocus && !isFocus) {
      timer(300)
        .pipe(takeUntil(this.preventLostFocus$))
        .subscribe(() => (this.isInFocus = isFocus));
      return;
    }
    this.isInFocus = isFocus;
  }
}
