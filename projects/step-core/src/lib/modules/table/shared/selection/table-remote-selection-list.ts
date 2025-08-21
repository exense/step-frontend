import { TableRemoteDataSource } from '../table-remote-data-source';
import { TableSelectionList } from './table-selection-list';
import { BulkSelectionType, UpdateSelectionMode } from '../../../entities-selection';
import { effect, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

export class TableRemoteSelectionList<T> extends TableSelectionList<T, TableRemoteDataSource<T>> {
  private pageData = toSignal(this.datasource.data$, { initialValue: [] });

  private effectCleanupOnDataChange = effect(
    () => {
      const data = this.pageData();
      const selectionType = untracked(() => this._entitySelectionState.selectionType());
      if (selectionType === BulkSelectionType.FILTERED || selectionType === BulkSelectionType.ALL) {
        this._entitySelectionState.updateSelection({ entities: data, mode: UpdateSelectionMode.UPDATE });
      }
    },
    { manualCleanup: true },
  );

  private effectHandleSelectionTypeChange = effect(
    () => {
      const selectionType = this._entitySelectionState.selectionType();
      this.handleSelectionChange(selectionType);
    },
    { manualCleanup: true },
  );

  constructor(datasource: TableRemoteDataSource<T>) {
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
    this._entitySelectionState.updateSelection({
      entities: [item],
      selectionType: BulkSelectionType.INDIVIDUAL,
      mode: UpdateSelectionMode.UPDATE,
    });
  }

  /**
   * Iterates over selected items, which are exists in collector.
   * Check the predicate and returns the map with entity's id and predicate result.
   * Method's result is approximate, because collector might not contain all information about every selected item
   * **/
  checkCurrentSelectionState(predicate: (item: T) => boolean): Map<unknown, boolean> | undefined {
    const data = this.pageData();
    return data
      .filter((entity) => this._entitySelectionState.isSelectedByKey(entity))
      .reduce((result, entity) => {
        const key = this._entitySelectionState.getSelectionKey(entity);
        result.set(key, predicate(entity));
        return result;
      }, new Map<unknown, boolean>());
  }

  private handleSelectionChange(selectionType: BulkSelectionType): void {
    switch (selectionType) {
      case BulkSelectionType.NONE:
        this.clearSelection();
        break;
      case BulkSelectionType.ALL:
      case BulkSelectionType.FILTERED:
      case BulkSelectionType.VISIBLE:
        const entities = untracked(() => this.pageData());
        this._entitySelectionState.updateSelection({ entities });
        break;
      default:
        break;
    }
  }
}
