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
  constructor(datasource: TableLocalDataSource<T>, entitySelectionState: EntitySelectionStateUpdatable<unknown, T>) {
    super(datasource, entitySelectionState);
  }

  private pageData = toSignal(this.datasource.data$, { initialValue: [] });
  private filteredData = toSignal(this.datasource.allFiltered$, { initialValue: [] });
  private allData = toSignal(this.datasource.allData$, { initialValue: [] });

  private hasFilter = computed(() => {
    const allData = this.allData();
    const filteredData = this.filteredData();
    return allData.length !== filteredData.length;
  });

  private effectFilterChange = effect(
    () => {
      const hasFilter = this.hasFilter();
      const currentSelectionType = untracked(() => this.entitySelectionState.selectionType());

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

  private effectHandleSelectionTypeChange = effect(
    () => {
      const selectionType = this.entitySelectionState.selectionType();
      this.handleSelectionChange(selectionType);
    },
    { manualCleanup: true },
  );

  destroy(): void {
    this.effectFilterChange.destroy();
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

    const currentSize = this.entitySelectionState.selectedSize();
    let selectionType = BulkSelectionType.INDIVIDUAL;

    if (currentSize + 1 === this.allData().length) {
      selectionType = BulkSelectionType.ALL;
    } else if (currentSize + 1 === this.filteredData().length) {
      selectionType = BulkSelectionType.FILTERED;
    }

    if (selectionType !== BulkSelectionType.INDIVIDUAL) {
      this.entitySelectionState.updateSelection({ selectionType });
      return;
    }

    this.entitySelectionState.updateSelection({ entities: [item], selectionType, mode: UpdateSelectionMode.UPDATE });
  }

  private handleSelectionChange(selectionType: BulkSelectionType): void {
    switch (selectionType) {
      case BulkSelectionType.NONE:
        this.clearSelection();
        break;
      case BulkSelectionType.ALL:
        this.entitySelectionState.updateSelection({ entities: this.allData() });
        break;
      case BulkSelectionType.FILTERED:
        this.entitySelectionState.updateSelection({ entities: this.filteredData() });
        break;
      case BulkSelectionType.VISIBLE:
        this.entitySelectionState.updateSelection({ entities: this.pageData() });
        break;
      default:
        break;
    }
  }
}
