import { Component, computed, effect, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { ViewMode } from '../../shared/view-mode';
import { MatSort, SortDirection } from '@angular/material/sort';

@Component({
  selector: 'step-alt-report-node-list',
  templateUrl: './alt-report-node-list.component.html',
  styleUrl: './alt-report-node-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[attr.title]': 'null',
  },
  standalone: false,
})
export class AltReportNodeListComponent {
  protected _state = inject(AltReportNodesStateService);
  private _matSort = inject(MatSort, { optional: true });

  /** @Input() **/
  readonly title = input('');

  /** @Input() **/
  readonly mode = input<ViewMode>(ViewMode.VIEW);

  /** @Input() **/
  readonly sortByColumn = input<string | undefined>(undefined);

  private sortInternal = signal<SortDirection>('desc');

  protected readonly sort = this.sortInternal.asReadonly();

  protected toggleSort(): void {
    this.sortInternal.update((sort) => (sort === 'asc' ? 'desc' : 'asc'));
  }

  private effectApplySort = effect(() => {
    const sort = this.sort();
    const sortByColumns = this.sortByColumn();
    if (!sortByColumns || !this._matSort) {
      return;
    }
    this._matSort.sort({ id: sortByColumns, start: sort, disableClear: true });
  });

  protected showSort = computed(() => {
    return this.sortByColumn() && this._matSort;
  });

  protected readonly statusText = this._state.getStatusText();
  protected readonly searchText = this._state.getSearchText();

  protected readonly ViewMode = ViewMode;
}
