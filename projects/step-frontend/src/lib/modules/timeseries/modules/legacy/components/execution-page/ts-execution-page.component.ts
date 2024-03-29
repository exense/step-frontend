import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AsyncTasksService, Execution, pollAsyncTask, TimeSeriesService } from '@exense/step-core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { ChartsViewComponent } from '../charts-view/charts-view.component';
import {
  TimeRangePickerSelection,
  TimeSeriesUtils,
  TimeSeriesConfig,
  ChartUrlParamsService,
  FilterBarItem,
  FilterBarItemType,
  COMMON_IMPORTS,
  ResolutionPickerComponent,
} from '../../../_common';
import { TimeSeriesDashboardComponent } from '../time-series-dashboard/time-series-dashboard.component';
import { PerformanceViewSettings } from '../../types/performance-view-settings';
import { TimeSeriesDashboardSettings } from '../../types/ts-dashboard-settings';

@Component({
  selector: 'step-execution-performance',
  templateUrl: './ts-execution-page.component.html',
  styleUrls: ['./ts-execution-page.component.scss'],
  providers: [ChartUrlParamsService],
  standalone: true,
  imports: [COMMON_IMPORTS, ResolutionPickerComponent, TimeSeriesDashboardComponent],
})
export class ExecutionPerformanceComponent implements OnInit, OnDestroy, OnChanges {
  private _chartUrlParams = inject(ChartUrlParamsService);

  terminator$ = new Subject<void>();

  @ViewChild('dashboard') dashboard!: TimeSeriesDashboardComponent;
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  @ViewChild(ChartsViewComponent) performanceView!: ChartsViewComponent;

  @Input() executionId!: string;
  @Input() executionInput: Execution | undefined;
  execution: Execution | undefined;

  timeRangeSelection: TimeRangePickerSelection = { type: 'FULL' };

  performanceViewSettings: PerformanceViewSettings | undefined;

  compareModeEnabled = false;
  executionHasToBeBuilt = false;
  migrationInProgress = false;

  updateSubscription = new Subscription();

  dashboardSettings: TimeSeriesDashboardSettings | undefined;

  private timeSeriesService = inject(TimeSeriesService);
  private _asyncTaskService = inject(AsyncTasksService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    if (!this.executionId) {
      throw new Error('ExecutionId parameter is not present');
    }
    this.timeSeriesService.checkTimeSeries(this.executionId).subscribe((exists) => {
      if (!exists) {
        this.executionHasToBeBuilt = true;
      }
    });
  }

  handleResolutionChange(resolution: number) {
    this.menuTrigger.closeMenu();
    this.dashboard.setChartsResolution(resolution);
  }

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    this.timeRangeSelection = selection;
    this.dashboard.updateFullRange(
      TimeSeriesUtils.convertExecutionAndSelectionToTimeRange(this.execution!, this.timeRangeSelection),
    );
  }

  // auto-refresh goes through here
  ngOnChanges(changes: SimpleChanges): void {
    let executionChange = changes['executionInput'];
    if (!executionChange) {
      return;
    }
    let currentExecution = executionChange.currentValue;
    if (!this.execution && currentExecution) {
      // it is first change
      this.initDashboard(currentExecution);
      this.cd.detectChanges();
    } else {
      this.dashboard.refresh(); // the new execution is sent via input
    }
  }

  initDashboard(execution: Execution) {
    this.execution = execution;
    const startTime = execution.startTime!;
    const endTime = execution.endTime ? execution.endTime : new Date().getTime();
    let urlParams = this._chartUrlParams.getUrlParams();
    const timeRangeOptions = TimeSeriesConfig.EXECUTION_PAGE_TIME_SELECTION_OPTIONS;
    this.dashboardSettings = {
      contextId: this.executionId,
      execution: execution,
      includeThreadGroupChart: true,
      timeRange: { from: startTime, to: endTime },
      timeRangeOptions: timeRangeOptions,
      activeTimeRange: timeRangeOptions[timeRangeOptions.length - 1],
      contextualFilters: { ...urlParams, eId: this.executionId },
      showContextualFilters: false,
      activeFilters: this.createBaseFilters(),
      filterOptions: this.createBaseFilters(),
    };
  }

  private createBaseFilters(): FilterBarItem[] {
    return [
      {
        label: 'Execution',
        attributeName: 'eId',
        type: FilterBarItemType.EXECUTION,
        searchEntities: [],
        removable: true,
        exactMatch: true,
        isHidden: true,
      },
      {
        label: 'Status',
        attributeName: 'rnStatus',
        type: FilterBarItemType.OPTIONS,
        textValues: [{ value: 'PASSED' }, { value: 'FAILED' }, { value: 'TECHNICAL_ERROR' }, { value: 'INTERRUPTED' }],
        isLocked: true,
        searchEntities: [],
      },
      {
        label: 'Type',
        attributeName: 'type',
        type: FilterBarItemType.OPTIONS,
        textValues: [{ value: 'keyword' }, { value: 'custom' }],
        isLocked: true,
        searchEntities: [],
      },
      {
        label: 'Name',
        attributeName: 'name',
        type: FilterBarItemType.FREE_TEXT,
        isLocked: true,
        searchEntities: [],
      },
    ];
  }

  rebuildTimeSeries() {
    this.migrationInProgress = true;
    this.timeSeriesService
      .rebuildTimeSeries({ executionId: this.executionId })
      .pipe(pollAsyncTask(this._asyncTaskService), takeUntil(this.terminator$))
      .subscribe({
        next: (task) => {
          if (task.ready) {
            this.migrationInProgress = false;
            this.executionHasToBeBuilt = false;
          } else {
            console.error('The task is not finished yet');
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  toggleCompareMode() {
    this.compareModeEnabled = !this.compareModeEnabled;
    if (this.compareModeEnabled) {
      this.dashboard.enableCompareMode();
    } else {
      this.dashboard.disableCompareMode();
    }
  }

  exportRawData() {
    this.dashboard.exportRawData();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}
