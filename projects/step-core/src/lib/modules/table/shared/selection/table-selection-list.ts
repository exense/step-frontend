import {
  BulkSelectionType,
  EntitySelectionStateUpdatable,
  SelectionList,
  UpdateSelectionMode,
} from '../../../entities-selection/entities-selection.module';
import { TableDataSource } from '../table-data-source';

export abstract class TableSelectionList<T, D extends TableDataSource<T>> extends SelectionList<unknown, T> {
  protected constructor(
    protected datasource: D,
    protected entitySelectionState: EntitySelectionStateUpdatable<unknown, T>,
  ) {
    super();
  }

  selectAll(): void {
    const selectionType = BulkSelectionType.ALL;
    this.entitySelectionState.updateSelection({ selectionType });
  }

  selectFiltered(): void {
    const selectionType = BulkSelectionType.FILTERED;
    this.entitySelectionState.updateSelection({ selectionType });
  }

  selectVisible(): void {
    const selectionType = BulkSelectionType.VISIBLE;
    this.entitySelectionState.updateSelection({ selectionType });
  }

  toggleSelection(item: T): void {
    if (this.entitySelectionState.isSelected(item)) {
      this.deselect(item);
    } else {
      this.select(item);
    }
  }

  selectIds(keys: unknown[]): void {
    this.entitySelectionState.updateSelection({
      keys,
      selectionType: BulkSelectionType.INDIVIDUAL,
      mode: UpdateSelectionMode.RESET,
    });
  }

  abstract destroy(): void;
}
