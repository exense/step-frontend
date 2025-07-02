import { Component, inject, ViewChild } from '@angular/core';
import {
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  BaseEntitySelectionTableComponent,
  DateFormat,
  Execution,
  FilterConditionFactoryService,
  FunctionPackage,
  SearchColDirective,
  selectionCollectionProvider,
  SelectionCollector,
  TableComponent,
} from '@exense/step-core';
import { DateTime } from 'luxon';

@Component({
  selector: 'step-execution-selection-table',
  templateUrl: './execution-selection-table.component.html',
  styleUrls: ['./execution-selection-table.component.scss'],
  providers: [...selectionCollectionProvider<string, Execution>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
  standalone: false,
})
export class ExecutionSelectionTableComponent extends BaseEntitySelectionTableComponent {
  private _filterConditionFactory = inject(FilterConditionFactoryService);
  protected _selectionCollector = inject<SelectionCollector<string, Execution>>(SelectionCollector);

  @ViewChild('tableRef', { read: TableComponent })
  protected _tableRef?: TableComponent<FunctionPackage>;
  protected dataSource = inject(AugmentedExecutionsService).getExecutionsTableDataSource();
  readonly DateFormat = DateFormat;

  searchByDate(col: SearchColDirective, date?: DateTime): void {
    const condition = this._filterConditionFactory.singleDateFilterCondition(date);
    col.search(condition);
  }
}
