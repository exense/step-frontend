import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { BehaviorSubject, forkJoin, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'step-timeseries-dashboard',
  templateUrl: './time-series-dashboard.component.html',
  styleUrls: ['./time-series-dashboard.component.scss'],
})
export class TimeSeriesDashboardComponent implements OnInit, OnDestroy {
  readonly ONE_HOUR_MS = 3600 * 1000;

  @Input() settings!: TimeSeriesDashboardSettings;
  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;

  timeRangeSelection: TimeRangePickerSelection = { type: RangeSelectionType.FULL };
  context!: TimeSeriesContext;
  performanceViewSettings: PerformanceViewSettings | undefined;
  updateSubscription = new Subscription();
  update$: Observable<any>;
  queuedSubscription = new Subscription();
  queuedUpdate$: Observable<any>;

  timeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last 1 Minute', timeInMs: this.ONE_HOUR_MS / 60 },
    { label: 'Last 5 Minutes', timeInMs: this.ONE_HOUR_MS / 12 },
    { label: 'Last 30 Minutes', timeInMs: this.ONE_HOUR_MS / 2 },
    { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS },
  ];

  constructor(private contextsFactory: TimeSeriesContextsFactory) {}

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
    forkJoin([this.update$]).subscribe(() => {});
  }

  /**
   * This is a force refresh (instantly triggered)
   */
  updateRange(selection: TimeRangePickerSelection) {
    this.timeRangeSelection = selection;
    this.updateSubscription?.unsubscribe(); // end current execution
    this.queuedSubscription.unsubscribe();
    this.context.updateFullRange(selection.absoluteSelection, false);
    this.context.updateSelectedRange(selection.absoluteSelection, false);
    this.update$ = this.performanceView.updateDashboard({
      updateRanger: true,
      updateCharts: true,
      showLoadingBar: true,
    });
    this.updateSubscription = this.update$.subscribe(() => this.context.setInProgress(false));
  }

  updateCharts() {
    this.context.setInProgress(true);
    // this.context.updateFullRange(request.fullTimeRange, false);
    // this.context.updateSelectedRange(request.selection, false);
  }

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Settings input must be set');
    }
    this.context = this.contextsFactory.createContext(this.settings.contextId, this.settings.timeRange);
    this.performanceViewSettings = this.settings;
  }

  ngOnDestroy(): void {}
}
