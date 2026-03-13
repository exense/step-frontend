import { Directive, forwardRef, inject, Injector, OnDestroy, runInInjectionContext } from '@angular/core';
import { EntitySelectionStateUpdatable, SelectionList } from '../../entities-selection';
import { TableSelectionListFactoryService } from '../shared/selection/table-selection-list-factory.service';
import { TableSelectionList } from '../shared/selection/table-selection-list';
import { TableDataSource } from '../shared/table-data-source';

@Directive({
  selector: '[stepTablePartSelectionList]',
  providers: [
    TableSelectionListFactoryService,
    {
      provide: SelectionList,
      useExisting: forwardRef(() => TablePartSelectionListDirective),
    },
  ],
})
export class TablePartSelectionListDirective<T> implements SelectionList<unknown, T>, OnDestroy {
  private _selectionState = inject(EntitySelectionStateUpdatable, { optional: true });
  private _tableSelectionListFactory = inject(TableSelectionListFactoryService);

  private tableSelectionList?: TableSelectionList<T, TableDataSource<T>>;

  ngOnDestroy(): void {
    this.destroySelectionList();
  }

  prepareSelectionList(dataSource: TableDataSource<T>): void {
    if (!this._selectionState) {
      return;
    }
    this.tableSelectionList = this._tableSelectionListFactory.create(dataSource);
  }

  destroySelectionList(): void {
    this.tableSelectionList?.destroy?.();
    this.tableSelectionList = undefined;
  }

  clearSelection(): void {
    this.tableSelectionList?.clearSelection?.();
  }

  deselect(item: T): void {
    this.tableSelectionList?.deselect?.(item);
  }

  select(item: T): void {
    this.tableSelectionList?.select?.(item);
  }

  selectAll(): void {
    this.tableSelectionList?.selectAll?.();
  }

  selectFiltered(): void {
    this.tableSelectionList?.selectFiltered?.();
  }

  selectVisible(): void {
    this.tableSelectionList?.selectVisible?.();
  }

  toggleSelection(item: T): void {
    this.tableSelectionList?.toggleSelection?.(item);
  }

  selectIds<K>(keys: K[]): void {
    this.tableSelectionList?.selectIds?.(keys);
  }

  checkCurrentSelectionState<K>(predicate: (item: T) => boolean): Map<K, boolean> | undefined {
    return this.tableSelectionList?.checkCurrentSelectionState?.(predicate) as Map<K, boolean> | undefined;
  }
}
