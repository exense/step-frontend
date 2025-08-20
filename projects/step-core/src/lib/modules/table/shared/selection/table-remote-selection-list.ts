import { TableRemoteDataSource } from '../table-remote-data-source';
import { TableSelectionList } from './table-selection-list';
import {
  BulkSelectionType,
  EntitySelectionStateUpdatable,
  UpdateSelectionMode,
} from '../../../entities-selection/entities-selection.module';
import { effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

export class TableRemoteSelectionList<T> extends TableSelectionList<T, TableRemoteDataSource<T>> {
  constructor(datasource: TableRemoteDataSource<T>, entitySelectionState: EntitySelectionStateUpdatable<unknown, T>) {
    super(datasource, entitySelectionState);
  }

  private pageData = toSignal(this.datasource.data$, { initialValue: [] });

  private effectCleanupOnDataChange = effect(
    () => {
      const data = this.pageData();
      this.clearSelection();
    },
    { manualCleanup: true },
  );

  private effectHandleSelectionTypeChange = effect(
    () => {
      const selectionType = this.entitySelectionState.selectionType();
      this.handleSelectionChange(selectionType);
    },
    { manualCleanup: true },
  );

  destroy(): void {
    this.effectCleanupOnDataChange.destroy();
    this.effectHandleSelectionTypeChange.destroy();
  }

  clearSelection(): void {
    const keys = [] as unknown[];
    const selectionType = BulkSelectionType.NONE;
    this.entitySelectionState.updateSelection({ keys, selectionType });
  }

  deselect(item: T): void {
    if (!this.entitySelectionState.isSelected(item)) {
      return;
    }
    if (this.entitySelectionState.selectedSize() === 1) {
      this.clearSelection();
      return;
    }
    this.entitySelectionState.updateSelection({
      entities: [item],
      selectionType: BulkSelectionType.INDIVIDUAL,
      mode: UpdateSelectionMode.REMOVE,
    });
  }

  select(item: T): void {
    if (this.entitySelectionState.isSelected(item)) {
      return;
    }
    this.entitySelectionState.updateSelection({
      entities: [item],
      selectionType: BulkSelectionType.INDIVIDUAL,
      mode: UpdateSelectionMode.UPDATE,
    });
  }

  private handleSelectionChange(selectionType: BulkSelectionType): void {
    switch (selectionType) {
      case BulkSelectionType.NONE:
        this.clearSelection();
        break;
      case BulkSelectionType.ALL:
      case BulkSelectionType.FILTERED:
      case BulkSelectionType.VISIBLE:
        const entities = this.pageData();
        this.entitySelectionState.updateSelection({ entities });
        break;
      default:
        break;
    }
  }
}
