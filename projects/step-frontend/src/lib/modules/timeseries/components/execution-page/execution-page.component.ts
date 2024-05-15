import { Component, inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
export class ExecutionPageComponent implements OnInit, OnChanges {
  @Input() execution!: Execution;
  @ViewChild(DashboardComponent) dashboard!: DashboardComponent;

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
        label: 'Execution',
        isLocked: true,
        exactMatch: true,
        freeTextValues: [],
        searchEntities: [{ searchValue: this.execution.id!, entity: this.execution }],
        type: FilterBarItemType.EXECUTION,
      },
    ];
    this.executionRange = this.getExecutionRange(this.execution);
    this.initialized = true;
  }

  getExecutionRange(execution: Execution): Partial<TimeRange> {
    return { from: execution.startTime, to: execution.endTime };
  }

  ngOnChanges(changes: SimpleChanges): void {
    const executionChange = changes['execution'];
    if (executionChange?.currentValue !== executionChange?.previousValue && !executionChange?.firstChange) {
      this.executionRange = this.getExecutionRange(this.execution);
      this.dashboard.refresh();
    }
  }
}
