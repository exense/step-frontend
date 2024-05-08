import { Component, Input, OnInit } from '@angular/core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  ResolutionPickerComponent,
  TimeRangePickerComponent,
} from '../../modules/_common';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { TableDashletComponent } from '../table-dashlet/table-dashlet.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { Execution, TimeRange } from '@exense/step-core';

@Component({
  selector: 'step-execution-page',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    DashboardFilterBarComponent,
    ChartDashletComponent,
    ResolutionPickerComponent,
    TimeRangePickerComponent,
    TableDashletComponent,
    DashboardComponent,
  ],
})
export class ExecutionPageComponent implements OnInit {
  @Input() execution!: Execution;

  dashboardId: string = '663b58002d1326716f3fa8dc';
  hiddenFilters: FilterBarItem[] = [];
  executionRange?: Partial<TimeRange>;

  initialized = false;

  ngOnInit(): void {
    if (!this.execution) {
      throw new Error('Execution input is mandatory');
    }
    this.hiddenFilters = [
      {
        attributeName: 'eId',
        exactMatch: true,
        freeTextValues: [this.execution.id!],
        searchEntities: [],
        type: FilterBarItemType.FREE_TEXT,
      },
    ];
    this.executionRange = { from: this.execution.startTime, to: this.execution.endTime };
    this.initialized = true;
  }
}
