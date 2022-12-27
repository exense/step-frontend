import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AJS_MODULE,
  AsyncTasksService,
  DashboardService,
  Execution,
  ExecutionsService,
  pollAsyncTask,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PerformanceViewSettings } from '../performance-view/model/performance-view-settings';
import { TimeSeriesService } from '../time-series.service';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { PerformanceViewComponent } from '../performance-view/performance-view.component';
import { forkJoin, Observable, of, Subject, Subscription, switchMap, takeUntil, timer } from 'rxjs';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TimeSeriesContext } from '../time-series-context';
import { TimeSeriesUtils } from '../time-series-utils';
import { TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';
import { TimeSeriesConfig } from '../time-series.config';
import { MatMenuTrigger } from '@angular/material/menu';
import { TimeSeriesDashboardSettings } from '../dashboard/model/ts-dashboard-settings';
import { TimeSeriesDashboardComponent } from '../dashboard/time-series-dashboard.component';

@Component({
  selector: 'step-execution-performance',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit, OnDestroy {
  readonly ONE_HOUR_MS = 3600 * 1000;

  terminator$ = new Subject<void>();

  @ViewChild('dashboard') dashboard!: TimeSeriesDashboardComponent;
  @ViewChild('matTrigger') matTrigger!: MatMenuTrigger;
  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;

  @Input() executionId!: string;
  private execution: Execution | undefined;
  context!: TimeSeriesContext;

  timeRangeSelection: TimeRangePickerSelection = { type: RangeSelectionType.FULL };

  private dashboardInitComplete$ = new Subject<void>();

  executionInProgress = false;
  performanceViewSettings: PerformanceViewSettings | undefined;
  intervalShouldBeCanceled = false;

  executionHasToBeBuilt = false;
  migrationInProgress = false;

  updateSubscription = new Subscription();

  dashboardSettings: TimeSeriesDashboardSettings | undefined;

  // this is just for running executions
  refreshIntervals: RefreshInterval[] = [
    { label: '5 Sec', value: 5000 },
    { label: '30 Sec', value: 30 * 1000 },
    { label: '1 Min', value: 60 * 1000 },
    { label: '5 Min', value: 5 * 60 * 1000 },
    { label: '30 Min', value: 30 * 60 * 1000 },
    { label: 'Off', value: 0 },
  ];
  timeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last 1 Minute', timeInMs: this.ONE_HOUR_MS / 60 },
    { label: 'Last 5 Minutes', timeInMs: this.ONE_HOUR_MS / 12 },
    { label: 'Last 30 Minutes', timeInMs: this.ONE_HOUR_MS / 2 },
    { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS },
  ];
  selectedRefreshInterval: RefreshInterval = this.refreshIntervals[0];

  customGroupingString = '';
  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;
  selectedGrouping = this.groupingOptions[0];
  refreshInterval: any;

  constructor(
    private timeSeriesService: TimeSeriesService,
    private contextsFactory: TimeSeriesContextsFactory,
    private executionService: ExecutionsService,
    private dashboardService: DashboardService,
    private _asyncTaskService: AsyncTasksService,
    private contextFactory: TimeSeriesContextsFactory
  ) {}

  ngOnInit(): void {
    if (!this.executionId) {
      throw new Error('ExecutionId parameter is not present');
    }
    this.timeSeriesService.timeSeriesIsBuilt(this.executionId).subscribe((exists) => {
      if (exists) {
        this.init();
      } else {
        this.executionHasToBeBuilt = true;
      }
    });
  }

  handleFiltersChange(filters: TsFilterItem[]): void {
    this.context.updateActiveFilters(filters);
  }

  applyCustomGrouping() {
    if (this.customGroupingString) {
      let dimensions = this.customGroupingString.split(',').map((x) => x.trim());
      this.selectedGrouping = { label: dimensions.join(', '), attributes: dimensions };
      this.emitGroupDimensions();
      this.matTrigger.closeMenu();
    }
  }

  emitGroupDimensions(): void {
    this.context.updateGrouping(this.selectedGrouping.attributes);
  }

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    // this.timeRangeSelection = selection;
    // this.updateSubscription?.unsubscribe();
    // this.triggerNextUpdate(0, of(null), true, true, true);
    let start = this.execution!.startTime!;
    const end = this.execution!.endTime! || new Date().getTime();
    let range: TSTimeRange = { from: 0, to: 0 };
    switch (selection.type) {
      case RangeSelectionType.FULL:
        range = { from: start, to: end };
        break;
      case RangeSelectionType.ABSOLUTE:
        range = selection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        range = { from: end - selection.relativeSelection!.timeInMs, to: end };
        break;
    }
    this.dashboard.updateRange(range);
  }

  init() {
    this.executionService.getExecutionById(this.executionId).subscribe((execution) => {
      this.execution = execution;
      const startTime = execution.startTime!;
      const endTime = execution.endTime ? execution.endTime : new Date().getTime();
      // this.context = this.contextFactory.createContext(execution.id!, { from: startTime, to: endTime });
      // this.subscribeForFiltersChange();
      if (!execution.endTime) {
        this.executionInProgress = true;
      }

      this.dashboardSettings = {
        contextId: this.executionId,
        includeThreadGroupChart: true,
        timeRange: { from: startTime, to: endTime },
        contextualFilters: { eId: this.executionId },
      };
      if (this.executionInProgress) {
        this.startInterval();
      }
    });
  }

  startInterval() {
    this.refreshInterval = setInterval(() => this.triggerRefresh(), this.selectedRefreshInterval.value);
  }

  triggerRefresh() {
    let now = new Date().getTime();
    let details = this.execution!;
    let isFullRangeSelected = this.context.isFullRangeSelected();
    let oldSelection = this.context.getSelectedTimeRange();
    let newFullRange: TSTimeRange;
    switch (this.timeRangeSelection.type) {
      case RangeSelectionType.FULL:
        newFullRange = { from: details.startTime!, to: details.endTime || now - 5000 };
        break;
      case RangeSelectionType.ABSOLUTE:
        newFullRange = this.timeRangeSelection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        let end = details.endTime || now;
        newFullRange = { from: end - this.timeRangeSelection.relativeSelection!.timeInMs!, to: end };
        break;
    }
    // when the selection is 0, it will switch to full selection automatically
    let newSelection = isFullRangeSelected
      ? newFullRange
      : TimeSeriesUtils.cropInterval(newFullRange, oldSelection) || newFullRange;

    this.performanceView.updateFullRange(newFullRange, newSelection);
    this.dashboard.refresh(newFullRange, newSelection);
  }

  rebuildTimeSeries() {
    this.migrationInProgress = true;
    this.timeSeriesService
      .rebuildTimeSeries(this.executionId)
      .pipe(pollAsyncTask(this._asyncTaskService))
      .subscribe({
        next: (task) => {
          if (task.ready) {
            this.migrationInProgress = false;
            this.executionHasToBeBuilt = false;
            this.init();
          } else {
            console.error('The task is not finished yet');
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  changeRefreshInterval(newInterval: RefreshInterval) {
    const oldInterval = this.selectedRefreshInterval;
    this.selectedRefreshInterval = newInterval;
    if (oldInterval.value === newInterval.value) {
      return;
    }
    // this.updatingSubscription.unsubscribe();
    // this.terminator$.next();
    clearInterval(this.refreshInterval);
    if (newInterval.value) {
      let delay = oldInterval.value === 0 ? 0 : newInterval.value;
      this.startInterval();
    }
  }

  /**
   *
   * @param delay
   * @param observableToWaitFor
   * @param forceUpdate - if true, no matter the zoom selection, all the charts will be updated.
   * @param showLoadingBar
   * @param resetSelection
   */
  triggerNextUpdate(
    delay: number,
    observableToWaitFor: Observable<unknown>,
    forceUpdate = false,
    showLoadingBar = false,
    resetSelection = false
  ): void {
    this.updateSubscription = forkJoin([timer(delay), observableToWaitFor])
      .pipe(
        takeUntil(this.terminator$),
        switchMap(() => {
          if (!this.executionInProgress && this.execution) {
            // it is ended
            return of(this.execution);
          } else {
            // we fetch new data about the execution to see if it ended
            return this.executionService.getExecutionById(this.executionId);
          }
        })
      )
      .subscribe((details) => {
        this.execution = details;
        let now = new Date().getTime();
        let isFullRangeSelected = this.context.isFullRangeSelected();
        let oldSelection = this.context.getSelectedTimeRange();
        let newFullRange: TSTimeRange;
        switch (this.timeRangeSelection.type) {
          case RangeSelectionType.FULL:
            newFullRange = { from: details.startTime!, to: details.endTime || now - 5000 };
            break;
          case RangeSelectionType.ABSOLUTE:
            newFullRange = this.timeRangeSelection.absoluteSelection!;
            break;
          case RangeSelectionType.RELATIVE:
            let end = details.endTime || now;
            newFullRange = { from: end - this.timeRangeSelection.relativeSelection!.timeInMs!, to: end };
            break;
        }
        // when the selection is 0, it will switch to full selection automatically
        let newSelection =
          isFullRangeSelected || resetSelection
            ? newFullRange
            : TimeSeriesUtils.cropInterval(newFullRange, oldSelection) || newFullRange;

        this.performanceView.updateFullRange(newFullRange, newSelection);
        this.updateSubscription = this.performanceView
          .updateDashboard({
            updateRanger: true,
            updateCharts: forceUpdate || JSON.stringify(newSelection) !== JSON.stringify(oldSelection),
            showLoadingBar: showLoadingBar,
          })
          .subscribe();
        this.dashboard.refresh(newFullRange, newSelection);

        // if (details.endTime) {
        //   this.intervalShouldBeCanceled = true;
        //   this.executionInProgress = false;
        //   updateDashboard$.subscribe();
        // } else {
        //   // the execution is not done yet
        //   if (this.selectedRefreshInterval.value) {
        //     this.triggerNextUpdate(this.selectedRefreshInterval.value, updateDashboard$); // recursive call
        //   } else {
        //     updateDashboard$.subscribe();
        //   }
        // }
      });
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmExecutionLink(this.executionId));
  }

  ngOnDestroy(): void {
    this.contextsFactory.destroyContext(this.executionId);
    this.dashboardInitComplete$.complete();
    // this.updatingSubscription.unsubscribe();
    this.terminator$.next();
    this.terminator$.complete();
  }
}

interface RefreshInterval {
  label: string;
  value: number; // 0 if it's off
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
