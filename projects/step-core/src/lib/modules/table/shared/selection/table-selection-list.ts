import {
  BulkSelectionType,
  EntitySelectionStateUpdatable,
  HasFilter,
  SelectionList,
  UpdateSelectionMode,
} from '../../../entities-selection/entities-selection.module';
import { TableDataSource } from '../table-data-source';
import { effect, inject, untracked } from '@angular/core';

export abstract class TableSelectionList<T, D extends TableDataSource<T>> extends SelectionList<unknown, T> {
  private _hasFilter = inject(HasFilter);
  protected _entitySelectionState = inject<EntitySelectionStateUpdatable<unknown, T>>(EntitySelectionStateUpdatable);

  private effectFilterChange = effect(
    () => {
      const hasFilter = this._hasFilter.hasFilter();
      const currentSelectionType = untracked(() => this._entitySelectionState.selectionType());

      if (hasFilter) {
        if (currentSelectionType === BulkSelectionType.ALL) {
          this.selectFiltered();
        }
      } else {
        if (currentSelectionType === BulkSelectionType.FILTERED) {
          this.selectAll();
        }
      }
    },
    { manualCleanup: true },
  );

  protected constructor(protected datasource: D) {
    super();
  }

  selectAll(): void {
    const selectionType = BulkSelectionType.ALL;
    this._entitySelectionState.updateSelection({ selectionType });
  }

  selectFiltered(): void {
    const selectionType = BulkSelectionType.FILTERED;
    this._entitySelectionState.updateSelection({ selectionType });
  }

  selectVisible(): void {
    const selectionType = BulkSelectionType.VISIBLE;
    this._entitySelectionState.updateSelection({ selectionType });
  }

  toggleSelection(item: T): void {
    if (this._entitySelectionState.isSelected(item)) {
      this.deselect(item);
    } else {
      this.select(item);
    }
  }

  selectIds(keys: unknown[]): void {
    this._entitySelectionState.updateSelection({
      keys,
      selectionType: BulkSelectionType.INDIVIDUAL,
      mode: UpdateSelectionMode.RESET,
    });
  }

  destroy(): void {
    this.effectFilterChange.destroy();
  }
}
