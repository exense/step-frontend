import { computed, Directive, effect, inject, input, signal } from '@angular/core';
import { MatSort, SortDirection } from '@angular/material/sort';
import { AltExecutionStateService } from '../services/alt-execution-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

@Directive({
  selector: '[stepAltReportNodeListSort]',
  exportAs: 'AltReportNodeListSort',
})
export class AltReportNodeListSortDirective {
  private _matSort = inject(MatSort, { optional: true });
  private _executionState = inject(AltExecutionStateService, { optional: true });

  readonly sortByColumn = input<string | undefined>(undefined);

  private executionSortMap = new Map<string, SortDirection>();
  private readonly executionId = toSignal(this._executionState?.executionId$ ?? of(''), { initialValue: '' });

  private readonly sortInternal = signal<SortDirection>('desc');

  readonly sort = this.sortInternal.asReadonly();

  readonly showSort = computed(() => {
    return this.sortByColumn() && this._matSort;
  });

  private effectApplySort = effect(() => {
    this.applySort(this.sort(), true);
  });

  private effectPersistExecutionSort = effect(() => {
    this.updateExecutionSort(this.sort());
  });

  toggleSort(): void {
    const nextSort = this.sort() === 'asc' ? 'desc' : 'asc';
    this.sortInternal.set(nextSort);
  }

  private applySort(sort: SortDirection, emitEvent = false): void {
    const sortByColumns = this.sortByColumn();
    if (!sortByColumns || !this._matSort) {
      return;
    }

    const activeChanged = this._matSort.active !== sortByColumns;
    const directionChanged = this._matSort.direction !== sort;
    this._matSort.active = sortByColumns;
    this._matSort.direction = sort;

    if (emitEvent && (activeChanged || directionChanged)) {
      this._matSort.sortChange.emit({ active: sortByColumns, direction: sort });
    }
  }

  private updateExecutionSort(sort: SortDirection): void {
    const executionId = this.executionId();
    if (!executionId) {
      return;
    }
    this.executionSortMap.set(executionId, sort);
  }
}
