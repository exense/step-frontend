import { Directive, inject, OnDestroy } from '@angular/core';
import { MatSort, MatSortable, Sort, SortDirection } from '@angular/material/sort';
import { MatColumnDef } from '@angular/material/table';
import { map, Observable, of, shareReplay, startWith, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: 'th[step-header-cell][stepSortHeader]',
})
export class SortHeaderDirective implements OnDestroy {
  protected terminator$ = new Subject<void>();
  private _matSort = inject(MatSort, { optional: true });
  private _matColumnDef = inject(MatColumnDef, { optional: true });

  readonly hasSort = !!this._matSort;

  private initialSort?: Sort = !this.hasSort
    ? undefined
    : {
        direction: this._matSort!.direction,
        active: this._matSort!.active,
      };

  readonly sortState$: Observable<SortDirection | undefined> = !this.hasSort
    ? of(undefined)
    : this._matSort!.sortChange.pipe(
        startWith(this.initialSort),
        map((sortValue) => {
          if (sortValue && this._matColumnDef && sortValue.active === this._matColumnDef.name) {
            return sortValue.direction;
          }
          return undefined;
        }),
        shareReplay(1),
        takeUntil(this.terminator$)
      );

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  toggleSort(): void {
    if (!this.hasSort || !this._matColumnDef) {
      return;
    }
    const sortable: MatSortable = {
      id: this._matColumnDef.name,
      disableClear: this._matSort!.disableClear,
      start: 'desc',
    };
    this._matSort!.sort(sortable);
  }
}
