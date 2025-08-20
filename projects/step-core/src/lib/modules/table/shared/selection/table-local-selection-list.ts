import { TableSelectionList } from './table-selection-list';
import { toSignal } from '@angular/core/rxjs-interop';
import { computed, effect, untracked } from '@angular/core';
import { TableLocalDataSource } from '../table-local-data-source';
import {
  BulkSelectionType,
  EntitySelectionStateUpdatable,
  UpdateSelectionMode,
} from '../../../entities-selection/entities-selection.module';

export class TableLocalSelectionList<T> extends TableSelectionList<T, TableLocalDataSource<T>> {
  private pageData = toSignal(this.datasource.data$, { initialValue: [] });
  private filteredData = toSignal(this.datasource.allFiltered$, { initialValue: [] });
  private allData = toSignal(this.datasource.allData$, { initialValue: [] });

  private effectHandleSelectionTypeChange = effect(
    () => {
      const selectionType = this._entitySelectionState.selectionType();
      this.handleSelectionChange(selectionType);
    },
    { manualCleanup: true },
  );

  constructor(datasource: TableLocalDataSource<T>) {
    super(datasource);
  }

  override destroy(): void {
    super.destroy();
    this.effectHandleSelectionTypeChange.destroy();
  }

  clearSelection(): void {
    const keys = [] as unknown[];
    const selectionType = BulkSelectionType.NONE;
    this._entitySelectionState.updateSelection({ keys, selectionType });
  }

  deselect(item: T): void {
    if (!this._entitySelectionState.isSelected(item)) {
      return;
    }
    if (this._entitySelectionState.selectedSize() === 1) {
      this.clearSelection();
      return;
    }
    this._entitySelectionState.updateSelection({
      entities: [item],
      selectionType: BulkSelectionType.INDIVIDUAL,
      mode: UpdateSelectionMode.REMOVE,
    });
  }

  select(item: T): void {
    if (this._entitySelectionState.isSelected(item)) {
      return;
    }

    const currentSize = this._entitySelectionState.selectedSize();
    let selectionType = BulkSelectionType.INDIVIDUAL;

    if (currentSize + 1 === this.allData().length) {
      selectionType = BulkSelectionType.ALL;
    } else if (currentSize + 1 === this.filteredData().length) {
      selectionType = BulkSelectionType.FILTERED;
    }

    if (selectionType !== BulkSelectionType.INDIVIDUAL) {
      this._entitySelectionState.updateSelection({ selectionType });
      return;
    }

    this._entitySelectionState.updateSelection({ entities: [item], selectionType, mode: UpdateSelectionMode.UPDATE });
  }

  private handleSelectionChange(selectionType: BulkSelectionType): void {
    switch (selectionType) {
      case BulkSelectionType.NONE:
        this.clearSelection();
        break;
      case BulkSelectionType.ALL:
        const allData = untracked(() => this.allData());
        this._entitySelectionState.updateSelection({ entities: allData });
        break;
      case BulkSelectionType.FILTERED:
        const filtered = untracked(() => this.filteredData());
        this._entitySelectionState.updateSelection({ entities: filtered });
        break;
      case BulkSelectionType.VISIBLE:
        const paged = untracked(() => this.pageData());
        this._entitySelectionState.updateSelection({ entities: paged });
        break;
      default:
        break;
    }
  }
}
