import { Component, computed, effect, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { ViewMode } from '../../shared/view-mode';
import { MatSort, SortDirection } from '@angular/material/sort';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

@Component({
  selector: 'step-alt-report-node-list',
  templateUrl: './alt-report-node-list.component.html',
  styleUrl: './alt-report-node-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltReportNodeListComponent {
  protected _state = inject(AltReportNodesStateService);
  private _matSort = inject(MatSort, { optional: true });
  private _executionState = inject(AltExecutionStateService, { optional: true });

  /** @Input() **/
  readonly mode = input<ViewMode>(ViewMode.VIEW);

  /** @Input() **/
  readonly sortByColumn = input<string | undefined>(undefined);

  private executionSortMap = new Map<string, SortDirection>();
  private readonly executionId = toSignal(this._executionState?.executionId$ ?? of(''), { initialValue: '' });

  private readonly sortInternal = signal<SortDirection>('desc');

  protected readonly sort = this.sortInternal.asReadonly();

  protected toggleSort(): void {
    const nextSort = this.sort() === 'asc' ? 'desc' : 'asc';
    this.sortInternal.set(nextSort);
  }

  private effectSyncExecutionSort = effect(() => {
    const executionId = this.executionId();
    const sort = executionId ? this.executionSortMap.get(executionId) ?? 'desc' : 'desc';
    this.sortInternal.set(sort);
  });

  private effectApplySort = effect(() => {
    this.applySort(this.sort(), true);
  });

  private effectPersistExecutionSort = effect(() => {
    this.updateExecutionSort(this.sort());
  });

  private updateExecutionSort(sort: SortDirection): void {
    const executionId = this.executionId();
    if (!executionId) {
      return;
    }
    this.executionSortMap.set(executionId, sort);
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

  protected readonly showSort = computed(() => {
    return this.sortByColumn() && this._matSort;
  });

  protected readonly statusText = this._state.getStatusText();
  protected readonly searchText = this._state.getSearchText();

  protected readonly ViewMode = ViewMode;
}
