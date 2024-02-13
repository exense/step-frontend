import { Component, inject, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import {
  AuthService,
  DashboardItem,
  DashboardsService,
  DashboardView,
  MetricAttribute,
  MetricType,
  TimeRange,
  TimeRangeSelection,
  TimeSeriesService,
} from '@exense/step-core';
import { FilterUtils } from '../../util/filter-utils';
import { TimeSeriesConfig } from '../../time-series.config';
import { TimeseriesColorsPool } from '../../util/timeseries-colors-pool';
import { TimeSeriesContext } from '../../time-series-context';
import { TimeSeriesContextsFactory } from '../../time-series-contexts-factory.service';
import { TimeRangePickerSelection } from '../../time-selection/time-range-picker-selection';

//@ts-ignore
import uPlot = require('uplot');
import { defaultIfEmpty, filter, forkJoin, merge, Observable, of, Subject, switchMap, takeUntil, throttle } from 'rxjs';
import { ChartDashletComponent } from './chart-dashlet/chart-dashlet.component';
import { Dashlet } from './model/dashlet';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DashboardFilterBarComponent } from '../../performance-view/filter-bar/dashboard-filter-bar.component';

type AggregationType = 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';

interface PageParams {
  editMode?: boolean;
}

const EDIT_PARAM_NAME = 'edit';

@Component({
  selector: 'step-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly AGGREGATES: AggregationType[] = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'RATE', 'MEDIAN'];
  readonly DASHLET_HEIGHT = 300;

  @ViewChildren(ChartDashletComponent) dashlets: Dashlet[] = [];
  @ViewChild(DashboardFilterBarComponent) filterBar?: DashboardFilterBarComponent;

  private _timeSeriesService = inject(TimeSeriesService);
  private _timeSeriesContextFactory = inject(TimeSeriesContextsFactory);
  private _dashboardService = inject(DashboardsService);
  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _router: Router = inject(Router);
  private _authService: AuthService = inject(AuthService);
  colorsPool: TimeseriesColorsPool = new TimeseriesColorsPool();

  dashboard!: DashboardView;
  dashboardBackup!: DashboardView;

  context!: TimeSeriesContext;

  compareModeEnabled = false;
  timeRangeOptions: TimeRangePickerSelection[] = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;
  timeRangeSelection: TimeRangePickerSelection = this.timeRangeOptions[0];

  terminator$ = new Subject<void>();

  editMode = false;
  metricTypes?: MetricType[];

  hasWritePermission = false;

  ngOnInit(): void {
    const pageParams = this.extractUrlParams();
    this.removeOneTimeUrlParams();
    this.hasWritePermission = this._authService.hasRight('dashboard-write');
    this._route.paramMap.subscribe((params) => {
      const id: string = params.get('id')!;
      if (!id) {
        throw new Error('Dashboard id not present');
      }
      this._dashboardService.getDashboardById(id).subscribe((dashboard) => {
        this.dashboard = dashboard;
        this.context = this.createContext(this.dashboard);
        this.subscribeForContextChange();
        this.subscribeForTimeRangeChange();
        if (pageParams.editMode && this.hasWritePermission) {
          this.fetchMetricTypes();
          this.enableEditMode();
        }
      });
    });
  }

  trackByName(index: number, item: MetricType): string {
    return item.name;
  }

  private extractUrlParams(): PageParams {
    const initialParams: Params = this._route.snapshot.queryParams;
    return {
      editMode: initialParams[EDIT_PARAM_NAME] == '1',
    };
  }

  ngOnDestroy(): void {
    this._timeSeriesContextFactory?.destroyContext(this.context?.id);
    this.terminator$.next();
    this.terminator$.complete();
  }

  enableEditMode() {
    this.dashboardBackup = { ...this.dashboard, dashlets: [...this.dashboard.dashlets.map((item) => ({ ...item }))] };
    this.editMode = true;
    if (!this.metricTypes) {
      this.fetchMetricTypes();
    }
  }

  private fetchMetricTypes() {
    this._timeSeriesService.getMetricTypes().subscribe((metrics) => (this.metricTypes = metrics));
  }

  cancelEditMode() {
    this.dashboard = { ...this.dashboardBackup };
    this.editMode = false;
  }

  saveEditChanges() {
    this.editMode = false;
    this.dashboard.grouping = this.context.getGroupDimensions();
    this.dashboard.timeRange = this.timeRangeSelection;
    this.dashboard.filters =
      this.filterBar?._internalFilters.map((item) => {
        const apiFilter = FilterUtils.convertToApiFilterItem(item);
        apiFilter.removable = false; // make all the fields not removable once saved
        return apiFilter;
      }) || [];
    this._dashboardService.saveDashboard(this.dashboard).subscribe((response) => {});
  }

  addDashlet(metric: MetricType) {
    let newDashlet: DashboardItem = {
      name: metric.displayName!,
      type: 'CHART',
      size: 1,
      chartSettings: {
        filters: [],
        metricKey: metric.name!,
        inheritGlobalFilters: true,
        inheritGlobalGrouping: true,
        grouping: metric.defaultGroupingAttributes || [],
        attributes: metric.attributes || [],
        readonlyAggregate: false,
        readonlyGrouping: false,
        primaryAxes: {
          aggregation: metric.defaultAggregation!,
          unit: metric.unit!,
          displayType: 'LINE',
          renderingSettings: metric.renderingSettings,
        },
      },
    };
    this.filterBar!.addFilterItems(
      newDashlet.chartSettings!.attributes.map((item) => FilterUtils.createFilterItemFromAttribute(item))
    );
    this.dashboard.dashlets.push(newDashlet);
    this.context.updateAttributes(this.collectAllAttributes());
  }

  private getTimeRangeFromTimeSelection(selection: TimeRangeSelection): TimeRange {
    switch (selection.type) {
      case 'ABSOLUTE':
        return { from: selection.absoluteSelection!.from!, to: selection.absoluteSelection!.to! };
      case 'RELATIVE':
        let now = new Date().getTime();
        return { from: now - selection.relativeSelection!.timeInMs!, to: now };
      default:
        throw new Error('Unsupported time selection type: ' + selection.type);
    }
  }

  createContext(dashboard: DashboardView): TimeSeriesContext {
    const dashboardTimeRange = dashboard.timeRange!;
    const timeRange: TimeRange = this.getTimeRangeFromTimeSelection(dashboard.timeRange);
    if (dashboard.timeRange.type === 'RELATIVE') {
      const timeInMs = dashboardTimeRange.relativeSelection!.timeInMs;
      const foundRelativeOption = this.timeRangeOptions.find((o) => {
        return o.type === 'RELATIVE' && timeInMs === o.relativeSelection?.timeInMs;
      });
      this.timeRangeSelection = foundRelativeOption || {
        type: 'RELATIVE',
        relativeSelection: {
          label: dashboardTimeRange.relativeSelection!.label || `Last ${timeInMs / 60000} minutes`,
          timeInMs: timeInMs,
        },
      };
    } else {
      // absolute
      this.timeRangeSelection = { ...dashboardTimeRange, type: dashboardTimeRange.type! };
    }
    const attributesByIds: Record<string, MetricAttribute> = {};
    this.dashboard.dashlets.forEach((d) =>
      d.chartSettings?.attributes?.forEach((attr) => (attributesByIds[attr.name] = attr))
    );
    return this._timeSeriesContextFactory.createContext({
      id: dashboard.id!,
      timeRange: timeRange,
      attributes: attributesByIds,
      grouping: dashboard.grouping || [],
      filters: dashboard.filters?.map(FilterUtils.convertApiFilterItem),
    });
  }

  subscribeForContextChange(): void {
    merge(this.context.onFilteringChange(), this.context.onGroupingChange())
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => {
        this.refreshAllCharts().subscribe();
      });
  }

  private getContext(compare: boolean): TimeSeriesContext {
    return this.context;
  }

  private subscribeForTimeRangeChange(compareCharts = false) {
    const context = this.getContext(compareCharts);
    context
      .onTimeSelectionChange()
      .pipe(
        switchMap((newRange) => this.handleSelectionChange(newRange)),
        takeUntil(compareCharts ? this.terminator$ : this.terminator$)
      )
      .subscribe();
  }

  private handleSelectionChange(range?: TimeRange): Observable<any[]> {
    return this.refreshAllCharts();
  }

  private refreshAllCharts(): Observable<any[]> {
    return forkJoin(this.dashlets?.map((dashlet) => dashlet.refresh())).pipe(defaultIfEmpty([]));
  }

  handleChartDelete(index: number) {
    this.dashboard.dashlets.splice(index, 1);
    this.context.updateAttributes(this.collectAllAttributes());
  }

  handleChartShiftLeft(index: number) {
    const listLength = this.dashboard.dashlets.length;
    let swapIndex = index - 1;
    if (index === 0) {
      // first element
      swapIndex = listLength - 1;
    }
    [this.dashboard.dashlets[index], this.dashboard.dashlets[swapIndex]] = [
      this.dashboard.dashlets[swapIndex],
      this.dashboard.dashlets[index],
    ];
  }

  handleChartShiftRight(index: number) {
    const listLength = this.dashboard.dashlets.length;
    let swapIndex = index + 1;
    if (index === listLength - 1) {
      // last element
      swapIndex = 0;
    }
    [this.dashboard.dashlets[index], this.dashboard.dashlets[swapIndex]] = [
      this.dashboard.dashlets[swapIndex],
      this.dashboard.dashlets[index],
    ];
  }

  handleTimeRangeChange(params: { selection: TimeRangePickerSelection; triggerRefresh: boolean }) {
    this.timeRangeSelection = params.selection;
    let range = this.getTimeRangeFromTimeSelection(params.selection);
    this.context.updateFullRange(range, false);
    this.context.updateSelectedRange(range, false);
    let refreshRanger$ = this.filterBar?.timeSelection?.refreshRanger();
    forkJoin([this.refreshAllCharts(), refreshRanger$]).subscribe(() => {});
  }

  collectAllAttributes() {
    return this.dashboard.dashlets.flatMap((d) => d.chartSettings!.attributes);
  }

  removeOneTimeUrlParams() {
    // Get a copy of the current query parameters
    const currentParams = { ...this._route.snapshot.queryParams };

    // Remove the specific parameter
    currentParams[EDIT_PARAM_NAME] = null;

    // Navigate with the updated parameters
    this._router.navigate([], {
      relativeTo: this._route,
      replaceUrl: true,
      queryParams: currentParams,
      queryParamsHandling: 'merge',
    });
  }
}
