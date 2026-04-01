import { Directive, inject } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { Observable, of, startWith } from 'rxjs';
import { TablePersistenceStateService } from '../services/table-persistence-state.service';

@Directive({
  selector: '[stepTablePartSort]',
})
export class TablePartSortDirective {
  private _tableState = inject(TablePersistenceStateService);
  private _sort = inject(MatSort, { optional: true });

  setupSortStream(): Observable<Sort | undefined> {
    if (!this._sort) {
      return of(undefined);
    }

    let initialSort: Sort | undefined = undefined;

    const sortState = this._tableState.getSort();

    if (sortState) {
      this._sort.active = sortState.active;
      this._sort.direction = sortState.direction;
      initialSort = sortState;
    } else if (this._sort.active) {
      const { active, direction } = this._sort;
      initialSort = { active, direction };
    }

    return this._sort.sortChange.pipe(startWith(initialSort));
  }
}
