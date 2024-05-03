import { Component, DestroyRef, inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {
  AugmentedTimeSeriesService,
  AuthService,
  DashboardItem,
  DashboardsService,
  DashboardView,
  MetricAttribute,
  MetricType,
  TimeRange,
  TimeRangeSelection,
  TimeSeriesAPIResponse,
} from '@exense/step-core';
import {
  COMMON_IMPORTS,
  FilterUtils,
  ResolutionPickerComponent,
  TimeRangePickerComponent,
  TimeRangePickerSelection,
  TimeSeriesConfig,
  TimeSeriesContext,
  TimeSeriesContextsFactory,
  TimeSeriesUtils,
} from '../../modules/_common';
import { defaultIfEmpty, forkJoin, merge, Observable, of, Subscription, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { MatMenuTrigger } from '@angular/material/menu';

//@ts-ignore
import uPlot = require('uplot');
import {
  DashboardUrlParams,
  DashboardUrlParamsService,
} from '../../modules/_common/injectables/dashboard-url-params.service';
import { TableDashletComponent } from '../table-dashlet/table-dashlet.component';
import { TableColumnType } from '../../modules/_common/types/table-column-type';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';

interface DashboardState {
  context: TimeSeriesContext;
  timeRangeSelection: TimeRangePickerSelection;
  getDashlets: () => QueryList<ChartDashlet>;
  getFilterBar: () => DashboardFilterBarComponent;
  refreshInProgress: boolean;
  refreshSubscription?: Subscription;
}

class DashboardStateEngine {
  state: DashboardState;

  constructor(state: DashboardState) {
    this.state = state;
  }

  subscribeForContextChange(): void {
    const context = this.state.context;
    merge(
      context.onFilteringChange(),
      context.onGroupingChange(),
      context.onChartsResolutionChange(),
      context.onTimeSelectionChange(),
    )
      // .pipe(takeUntilDestroyed(this._destroyRef)) TODO
      .subscribe(() => {
        this.refreshAllCharts(false, true);
      });
  }

  triggerRefresh(force: boolean = false) {
    const state = this.state;
    if (state.context.compareModeChange$.getValue().enabled) {
      // refresh is not enabled on compare mode
      return;
    }
    if ((state.refreshInProgress || state.context.getChartsLockedState()) && !force) {
      return;
    }
    const refreshRanger = state.timeRangeSelection.type === 'RELATIVE';
    if (refreshRanger) {
      const newTimeRange = TimeSeriesUtils.convertSelectionToTimeRange(state.timeRangeSelection);
      this.updateFullAndSelectedRange(newTimeRange);
    }
    this.refreshAllCharts(refreshRanger, force);
  }

  /**
   * If the current selection is full, this method will preserve the full selection, no matter of the new range.
   * If there is a custom selection, it will try to be preserved, cropping it if needed.
   * If the current selection does not fit into the new range, the full selection will be set instead
   */
  updateFullAndSelectedRange(fullRange: TimeRange) {
    const context = this.state.context;
    const isFullRangeSelected = context.isFullRangeSelected();
    if (isFullRangeSelected) {
      context.updateFullRange(fullRange, false);
      context.updateSelectedRange(fullRange, false);
    } else {
      let newSelection = context.getSelectedTimeRange();
      // we crop it
      const newFrom = Math.max(fullRange.from!, newSelection.from!);
      const newTo = Math.min(fullRange.to!, newSelection.to!);
      if (newTo - newFrom < 3) {
        newSelection = fullRange; // zoom reset when the interval is very small
      } else {
        newSelection = { from: newFrom, to: newTo };
      }
      context.updateFullRange(fullRange, false);
      context.updateSelectedRange(newSelection, false);
    }
  }

  /**
   * Handle full range interval changes, not selection changes.
   */
  handleTimeRangeChange(params: { selection: TimeRangePickerSelection; triggerRefresh: boolean }) {
    const state = this.state;
    const range = this.getTimeRangeFromTimeSelection(params.selection);
    state.timeRangeSelection = params.selection;
    state.context.updateFullRange(range, false);
    state.context.updateSelectedRange(range, false);
    this.refreshRanger().subscribe();
    this.refreshAllCharts(true, true);
  }

  //  private subscribeForTimeRangeChange() {
  //   const context = this.state.context;
  //   context
  //     .onTimeSelectionChange()
  //     // .pipe(takeUntilDestroyed(this._destroyRef)) // TODO
  //     .subscribe(() => this.refreshAllCharts(false, true));
  // }

  /**
   * @param refreshRanger. Set true if ranger data has to be updated
   * @param force. If set to false (default), the refresh will be skipped if there is a refresh in progress.
   * @private
   */
  public refreshAllCharts(refreshRanger = false, force = false): void {
    const state = this.state;
    state.refreshSubscription?.unsubscribe();
    state.refreshInProgress = true;
    state.refreshSubscription = of(null)
      .pipe(
        tap(() => (state.refreshInProgress = true)),
        switchMap(() => {
          const dashlets$ = state.getDashlets().map((dashlet) => dashlet.refresh());
          if (refreshRanger) {
            dashlets$.push(this.refreshRanger());
          }
          return forkJoin(dashlets$).pipe(defaultIfEmpty([]));
        }),
        tap(() => (state.refreshInProgress = false)),
      )
      .subscribe();
  }

  refreshRanger(): Observable<TimeSeriesAPIResponse> {
    return this.state.getFilterBar().timeSelection!.refreshRanger();
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
}

@Component({
  selector: 'step-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  providers: [DashboardUrlParamsService],
  imports: [
    COMMON_IMPORTS,
    DashboardFilterBarComponent,
    ChartDashletComponent,
    ResolutionPickerComponent,
    TimeRangePickerComponent,
    TableDashletComponent,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly DASHLET_HEIGHT = 300;

  @ViewChildren('chart') dashlets!: QueryList<ChartDashlet>;
  @ViewChildren('compareChart') compareDashlets!: QueryList<ChartDashlet>;
  @ViewChild('filterBar') filterBar?: DashboardFilterBarComponent;
  @ViewChild('compareFilterBar') compareFilterBar?: DashboardFilterBarComponent;
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;

  private _timeSeriesService = inject(AugmentedTimeSeriesService);
  private _timeSeriesContextFactory = inject(TimeSeriesContextsFactory);
  private _dashboardService = inject(DashboardsService);
  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _router: Router = inject(Router);
  private _authService: AuthService = inject(AuthService);
  private _urlParamsService: DashboardUrlParamsService = inject(DashboardUrlParamsService);
  private _destroyRef = inject(DestroyRef);

  private exportInProgress = false;

  dashboard!: DashboardView;
  dashboardBackup!: DashboardView;
  refreshInterval: number = 0;

  compareModeEnabled = false;
  timeRangeOptions: TimeRangePickerSelection[] = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;
  resolution?: number;

  editMode = false;
  metricTypes?: MetricType[];

  hasWritePermission = false;

  mainEngine!: DashboardStateEngine;
  compareEngine?: DashboardStateEngine;

  ngOnInit(): void {
    const pageParams = this._urlParamsService.collectUrlParams();
    this.resolution = pageParams.resolution;
    this.removeOneTimeUrlParams();
    this.hasWritePermission = this._authService.hasRight('dashboard-write');
    this._route.paramMap.subscribe((params) => {
      const id: string = params.get('id')!;
      if (!id) {
        throw new Error('Dashboard id not present');
      }
      this._dashboardService.getDashboardById(id).subscribe((dashboard) => {
        this.dashboard = dashboard;
        this.refreshInterval =
          (pageParams.refreshInterval !== undefined ? pageParams.refreshInterval : this.dashboard.refreshInterval) || 0;
        this.resolution = pageParams.resolution || this.dashboard.resolution;
        pageParams.resolution = this.resolution;
        const timeRangeSelection = this.computeTimeRange(dashboard, pageParams);
        const context = this.createContext(this.dashboard, pageParams, timeRangeSelection);
        const state = {
          context: context,
          timeRangeSelection: timeRangeSelection,
          getFilterBar: () => this.filterBar!,
          getDashlets: () => this.dashlets,
          refreshInProgress: false,
        };
        this.mainEngine = new DashboardStateEngine(state);
        this.mainEngine.subscribeForContextChange();

        this.updateUrl();
        context.stateChange$.subscribe((stateChanged) => {
          this.updateUrl();
        });
        // this.subscribeForTimeRangeChange();
        if (pageParams.editMode && this.hasWritePermission) {
          this.fetchMetricTypes();
          this.enableEditMode();
        }
      });
    });
  }

  handleRefreshIntervalChange(interval: number) {
    this.refreshInterval = interval;
    this.updateUrl();
    this.mainEngine.triggerRefresh();
  }

  handleResolutionChange(resolution: number) {
    if (resolution > 0 && resolution < 1000) {
      // minimum value should be one second
      return;
    }
    this.mainEngine.state.context.updateChartsResolution(resolution);
    this.compareEngine?.state.context.updateChartsResolution(resolution);
  }

  private updateUrl(): void {
    this._urlParamsService.updateUrlParams(
      this.mainEngine.state.context,
      this.mainEngine.state.timeRangeSelection,
      this.refreshInterval,
    );
  }

  enableEditMode() {
    this.dashboardBackup = JSON.parse(JSON.stringify(this.dashboard));
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
    this.dashboard.grouping = this.mainEngine.state.context.getGroupDimensions();
    this.dashboard.timeRange = this.mainEngine.state.timeRangeSelection;
    this.dashboard.refreshInterval = this.refreshInterval;
    this.dashboard.resolution = this.resolution;
    this.dashboard.filters =
      this.filterBar?._internalFilters.map((item) => {
        const apiFilter = FilterUtils.convertToApiFilterItem(item);
        apiFilter.removable = false; // make all the fields not removable once saved
        return apiFilter;
      }) || [];

    this._dashboardService.saveDashboard(this.dashboard).subscribe((response) => {});
    this.mainEngine.refreshAllCharts(false, true);
  }

  addTableDashlet(metric: MetricType) {
    let tableItem: DashboardItem = {
      id: 'table-' + new Date().getTime(),
      type: 'TABLE',
      name: metric.displayName,
      attributes: metric.attributes || [],
      grouping: metric.defaultGroupingAttributes || [],
      metricKey: metric.name!,
      filters: [],
      size: 2,
      inheritGlobalGrouping: true,
      inheritGlobalFilters: true,
      readonlyAggregate: true,
      readonlyGrouping: true,
      tableSettings: {
        columns: Object.keys(TableColumnType).map((k) => ({ column: k as TableColumnType, selected: true })),
      },
    };
    this.dashboard.dashlets.push(tableItem);
    this.mainEngine.state.context.updateDashlets(this.dashboard.dashlets);
  }

  addChartDashlet(metric: MetricType) {
    const newDashlet: DashboardItem = {
      id: 'chart-' + new Date().getTime(),
      name: metric.displayName,
      type: 'CHART',
      size: 1,
      metricKey: metric.name!,
      filters: [],
      grouping: metric.defaultGroupingAttributes || [],
      attributes: metric.attributes || [],
      readonlyAggregate: false,
      readonlyGrouping: false,
      inheritGlobalFilters: true,
      inheritGlobalGrouping: true,
      chartSettings: {
        primaryAxes: {
          aggregation: metric.defaultAggregation!,
          unit: metric.unit!,
          displayType: 'LINE',
          colorizationType: 'STROKE',
          renderingSettings: metric.renderingSettings,
        },
      },
    };
    this.filterBar!.addUniqueFilterItems(
      newDashlet.attributes.map((item) => FilterUtils.createFilterItemFromAttribute(item)),
    );
    this.dashboard.dashlets.push(newDashlet);
    this.mainEngine.state.context.updateAttributes(this.collectAllAttributes());
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

  private computeTimeRange(dashboard: DashboardView, urlParams: DashboardUrlParams): TimeRangeSelection {
    let timeRangeSelection = urlParams.timeRange || dashboard.timeRange!;
    if (timeRangeSelection.type === 'RELATIVE') {
      const timeInMs = timeRangeSelection.relativeSelection!.timeInMs;
      const foundRelativeOption = this.timeRangeOptions.find((o) => {
        return timeInMs === o.relativeSelection?.timeInMs;
      });
      timeRangeSelection = foundRelativeOption || {
        type: 'RELATIVE',
        relativeSelection: {
          label: timeRangeSelection.relativeSelection!.label || `Last ${timeInMs / 60000} minutes`,
          timeInMs: timeInMs,
        },
      };
    } else {
      // absolute
      timeRangeSelection = { ...timeRangeSelection, type: timeRangeSelection.type! };
    }
    return timeRangeSelection;
  }

  createContext(
    dashboard: DashboardView,
    urlParams: DashboardUrlParams,
    timeRangeSelection: TimeRangeSelection,
  ): TimeSeriesContext {
    const metricAttributes: MetricAttribute[] = this.dashboard.dashlets.flatMap((d) => d.attributes || []);
    const urlFilters = FilterUtils.convertUrlKnownFilters(urlParams.filters, metricAttributes).filter(
      FilterUtils.filterItemIsValid,
    );
    const timeRange: TimeRange = this.getTimeRangeFromTimeSelection(timeRangeSelection);

    // url filters are excluded from the dashboard filters
    const dashboardFilters = dashboard.filters
      ?.map(FilterUtils.convertApiFilterItem)
      .filter((filter) => !urlFilters.find((f) => f.attributeName === filter.attributeName));
    return this._timeSeriesContextFactory.createContext({
      id: dashboard.id!,
      dashlets: this.dashboard.dashlets,
      timeRange: timeRange,
      attributes: metricAttributes,
      grouping: urlParams.grouping || dashboard.grouping || [],
      filters: [...urlFilters, ...dashboardFilters],
      resolution: urlParams.resolution,
    });
  }

  handleChartDelete(index: number) {
    const itemToDelete = this.dashboard.dashlets[index];
    this.dashboard.dashlets.splice(index, 1);
    this.mainEngine.state.context.updateAttributes(this.collectAllAttributes());
    if (itemToDelete.type === 'TABLE') {
      this.dashboard.dashlets
        .filter((d) => d.masterChartId === itemToDelete.id)
        .forEach((i) => (i.masterChartId = undefined));
    }
    this.mainEngine.state.context.updateDashlets(this.dashboard.dashlets);
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

  toggleCompareMode() {
    this.compareModeEnabled = !this.compareModeEnabled;
    if (this.compareModeEnabled) {
      this.enableCompareMode();
    } else {
      this.disableCompareMode();
    }
  }

  disableCompareMode() {
    this.mainEngine.state.context.disableCompareMode();
    this.dashlets.forEach((d) => {
      if (d.getType() === 'TABLE') {
        (d as TableDashletComponent).disableCompareMode();
      }
    });
  }

  enableCompareMode() {
    const mainState = this.mainEngine.state;
    const timeRange = JSON.parse(JSON.stringify(mainState.context.getFullTimeRange()));
    const compareModeContext = this._timeSeriesContextFactory.createContext({
      dashlets: JSON.parse(JSON.stringify(this.dashboard.dashlets)), // clone
      timeRange: timeRange,
      id: new Date().getTime().toString(),
      attributes: this.mainEngine.state.context.getAllAttributes(),
      grouping: mainState.context.getGroupDimensions(),
      filters: JSON.parse(JSON.stringify(this.mainEngine.state.context.getFilteringSettings().filterItems)),
      colorsPool: mainState.context.colorsPool,
      syncGroups: mainState.context.getSyncGroups(),
    });
    const state = {
      context: compareModeContext,
      timeRangeSelection: JSON.parse(JSON.stringify(mainState.timeRangeSelection)),
      getDashlets: () => this.compareDashlets,
      getFilterBar: () => this.compareFilterBar!,
      refreshInProgress: false,
    };
    compareModeContext.stateChange$.subscribe(() => {
      this.dashlets.forEach((d) => {
        if (d.getType() === 'TABLE') {
          (d as TableDashletComponent).refreshCompareData().subscribe();
        }
      });
    });
    this.compareEngine = new DashboardStateEngine(state);
    this.compareEngine.subscribeForContextChange();
    mainState.context.enableCompareMode(compareModeContext);
    this.dashlets.forEach((d) => {
      if (d.getType() === 'TABLE') {
        (d as TableDashletComponent).enableCompareMode(compareModeContext);
      }
    });
  }

  collectAllAttributes(): MetricAttribute[] {
    return this.dashboard.dashlets.flatMap((d) => d.attributes);
  }

  removeOneTimeUrlParams() {
    // Get a copy of the current query parameters
    const currentParams = { ...this._route.snapshot.queryParams };

    // Remove the specific parameter
    currentParams[TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX + 'edit'] = null;

    // Navigate with the updated parameters
    this._router.navigate([], {
      relativeTo: this._route,
      replaceUrl: true,
      queryParams: currentParams,
      queryParamsHandling: 'merge',
    });
  }

  exportRawData(): void {
    if (this.exportInProgress || !this.mainEngine.state.context) {
      return;
    }
    this.exportInProgress = true;
    const oqlFilter = this.mainEngine.state.context.buildActiveOQL(true, true);
    this._timeSeriesService.exportRawMeasurementsAsCSV(oqlFilter).subscribe({
      complete: () => (this.exportInProgress = false),
    });
  }

  ngOnDestroy(): void {
    this._timeSeriesContextFactory.destroyContext(this.mainEngine.state.context.id);
    this._timeSeriesContextFactory.destroyContext(this.compareEngine?.state.context.id);
  }
}
