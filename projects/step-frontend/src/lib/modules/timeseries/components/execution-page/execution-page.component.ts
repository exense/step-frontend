import { Component, inject, Input, OnInit } from '@angular/core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  ResolutionPickerComponent,
  TimeRangePickerComponent,
  TimeSeriesConfig,
} from '../../modules/_common';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { TableDashletComponent } from '../table-dashlet/table-dashlet.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthService, Execution, TimeRange } from '@exense/step-core';

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

  private _authService = inject(AuthService);

  dashboardId!: string;
  hiddenFilters: FilterBarItem[] = [];
  executionRange?: Partial<TimeRange>;

  initialized = false;

  ngOnInit(): void {
    if (!this.execution) {
      throw new Error('Execution input is mandatory');
    }
    this.dashboardId = this._authService.getConf()!.miscParams![TimeSeriesConfig.PARAM_KEY_EXECUTION_DASHBOARD_ID];
    if (!this.dashboardId) {
      throw new Error('Execution dashboard id is not present on conf');
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
