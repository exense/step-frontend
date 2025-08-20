import { Component, inject, viewChild } from '@angular/core';
import {
  AugmentedExecutionsService,
  BaseEntitySelectionTableComponent,
  DateFormat,
  entitySelectionStateProvider,
  Execution,
  FilterConditionFactoryService,
  FunctionPackage,
  SearchColDirective,
  TableComponent,
} from '@exense/step-core';
import { DateTime } from 'luxon';

@Component({
  selector: 'step-execution-selection-table',
  templateUrl: './execution-selection-table.component.html',
  styleUrls: ['./execution-selection-table.component.scss'],
  providers: [...entitySelectionStateProvider<string, Execution>('id')],
  standalone: false,
})
export class ExecutionSelectionTableComponent extends BaseEntitySelectionTableComponent {
  private _filterConditionFactory = inject(FilterConditionFactoryService);
  protected _dataSource = inject(AugmentedExecutionsService).getExecutionsTableDataSource();

  protected tableRef = viewChild('tableRef', { read: TableComponent<FunctionPackage> });

  protected readonly DateFormat = DateFormat;

  searchByDate(col: SearchColDirective, date?: DateTime): void {
    const condition = this._filterConditionFactory.singleDateFilterCondition(date);
    col.search(condition);
  }
}
