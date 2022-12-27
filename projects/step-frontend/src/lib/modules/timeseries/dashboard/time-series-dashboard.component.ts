import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TimeSeriesContext } from '../time-series-context';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';
import { TimeSeriesDashboardSettings } from './model/ts-dashboard-settings';
import { PerformanceViewSettings } from '../performance-view/model/performance-view-settings';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { PerformanceViewComponent } from '../performance-view/performance-view.component';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { filter, Observable, of, Subject, Subscription, takeUntil, combineLatest, throttle, merge, skip } from 'rxjs';
import { TimeSeriesContextParams } from '../time-series-context-params';

@Component({
  selector: 'step-timeseries-dashboard',
  templateUrl: './time-series-dashboard.component.html',
  styleUrls: ['./time-series-dashboard.component.scss'],
})
export class TimeSeriesDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly ONE_HOUR_MS = 3600 * 1000;

  @Input() settings!: TimeSeriesDashboardSettings;
  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;

  timeRangeSelection: TimeRangePickerSelection = { type: RangeSelectionType.FULL };
  context!: TimeSeriesContext;
  performanceViewSettings: PerformanceViewSettings | undefined;
  updateSubscription = new Subscription();
  update$: Observable<any> | undefined;
  updateGate$: Subject<any> = new Subject<any>();
  queuedSubscription = new Subscription();
  refreshTrigger$: Subject<any> = new Subject();
  terminator$ = new Subject();

  timeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last 1 Minute', timeInMs: this.ONE_HOUR_MS / 60 },
    { label: 'Last 5 Minutes', timeInMs: this.ONE_HOUR_MS / 12 },
    { label: 'Last 30 Minutes', timeInMs: this.ONE_HOUR_MS / 2 },
    { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS },
  ];

  constructor(private contextsFactory: TimeSeriesContextsFactory) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Settings input must be set');
    }
    const contextParams: TimeSeriesContextParams = {
      id: this.settings.contextId,
      timeRange: this.settings.timeRange,
      baseFilters: this.settings.contextualFilters,
      dynamicFilters: [],
      grouping: ['name'],
    };
    this.context = this.contextsFactory.createContext(contextParams);
    this.performanceViewSettings = this.settings;
    this.subscribeForContextChange();
    this.refreshTrigger$
      .pipe(
        throttle(() => this.context.inProgressChange().pipe(filter((x) => !x))),
        takeUntil(this.terminator$)
      )
      .subscribe(() => {
        this.updateDashboard();
      });
  }

  private updateDashboard() {
    this.updateSubscription = this.performanceView
      .updateDashboard({
        updateRanger: true,
        updateCharts: true,
        showLoadingBar: true,
      })
      .subscribe();
  }

  subscribeForContextChange(): void {
    merge(this.context.onFiltersChange(), this.context.onGroupingChange())
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => {
        this.updateSubscription?.unsubscribe();
        this.updateDashboard();
      });
  }

  handleFiltersChange(filters: TsFilterItem[]): void {
    this.context.updateActiveFilters(filters);
  }

  handleGroupingChange(dimensions: string[]) {
    this.context.updateGrouping(dimensions);
  }

  /**
   * This method has to make sure that it doesn't overlap another running update
   * @param range
   */
  refresh(range: TSTimeRange): void {
    this.refreshTrigger$.next(true);
  }

  /**
   * This is a force refresh (instantly triggered)
   */
  updateRange(selection: TimeRangePickerSelection) {
    this.timeRangeSelection = selection;
    this.updateSubscription?.unsubscribe(); // end current execution
    this.queuedSubscription.unsubscribe();
    this.context.updateFullRange(selection.absoluteSelection!, false);
    this.context.updateSelectedRange(selection.absoluteSelection!, false);
    this.updateSubscription = this.performanceView
      .updateDashboard({
        updateRanger: true,
        updateCharts: true,
        showLoadingBar: true,
      })
      .subscribe();
  }

  updateCharts() {
    this.context.setInProgress(true);
    // this.context.updateFullRange(request.fullTimeRange, false);
    // this.context.updateSelectedRange(request.selection, false);
  }

  ngOnDestroy(): void {
    this.terminator$.next(true);
  }
}
