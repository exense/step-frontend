import { Component, inject, viewChild } from '@angular/core';
import {
  AugmentedExecutionsService,
  BaseEntitySelectionTableComponent,
  DateFormat,
  entitySelectionStateProvider,
  Execution,
  FilterConditionFactoryService,
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

  protected readonly tableRef = viewChild('tableRef', { read: TableComponent<Execution> });

  protected readonly DateFormat = DateFormat;

  protected searchByDate(col: SearchColDirective, date?: DateTime): void {
    const condition = this._filterConditionFactory.singleDateFilterCondition(date);
    col.search(condition);
  }
}
