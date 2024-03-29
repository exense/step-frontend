import { Component, DestroyRef, inject, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import {
  AuthService,
  DashboardItem,
  DashboardsService,
  DashboardView,
  MetricAttribute,
  MetricType,
  TimeRange,
  TimeRangeSelection,
  TimeSeriesAPIResponse,
  TimeSeriesService,
  TimeUnit,
} from '@exense/step-core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  TimeRangePickerSelection,
  TimeSeriesConfig,
  TimeSeriesContext,
  TimeSeriesContextsFactory,
  TimeSeriesUtils,
} from '../../modules/_common';
import { defaultIfEmpty, forkJoin, merge, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatMenuTrigger } from '@angular/material/menu';

//@ts-ignore
import uPlot = require('uplot');
import {
  DashboardUrlParams,
  DashboardUrlParamsService,
} from '../../modules/_common/injectables/dashboard-url-params.service';

type AggregationType = 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';

interface MetricAttributeSelection extends MetricAttribute {
  selected: boolean;
}

const EDIT_PARAM_NAME = 'edit';

@Component({
  selector: 'step-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  providers: [DashboardUrlParamsService],
  imports: [COMMON_IMPORTS, DashboardFilterBarComponent, ChartDashletComponent],
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly DASHLET_HEIGHT = 300;

  @ViewChildren(ChartDashletComponent) dashlets: ChartDashletComponent[] = [];
  @ViewChild(DashboardFilterBarComponent) filterBar?: DashboardFilterBarComponent;
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;

  private _timeSeriesService = inject(TimeSeriesService);
  private _timeSeriesContextFactory = inject(TimeSeriesContextsFactory);
  private _dashboardService = inject(DashboardsService);
  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _router: Router = inject(Router);
  private _authService: AuthService = inject(AuthService);
  private _urlParamsService: DashboardUrlParamsService = inject(DashboardUrlParamsService);
  private _destroyRef = inject(DestroyRef);

  dashboard!: DashboardView;
  dashboardBackup!: DashboardView;
  refreshInProgress = false;
  refreshSubscription?: Subscription;
  refreshInterval: number = 0;

  context!: TimeSeriesContext;

  compareModeEnabled = false;
  timeRangeOptions: TimeRangePickerSelection[] = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;
  timeRangeSelection: TimeRangePickerSelection = this.timeRangeOptions[0];
  resolution?: number;

  editMode = false;
  metricTypes?: MetricType[];

  hasWritePermission = false;

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
        this.refreshInterval = pageParams.refreshInterval || this.dashboard.refreshInterval || 0;
        this.resolution = pageParams.resolution || this.dashboard.resolution;
        pageParams.resolution = this.resolution;
        this.context = this.createContext(this.dashboard, pageParams);
        this.updateUrl();
        this.context.stateChange$.subscribe((stateChanged) => {
          this.updateUrl();
        });

        this.subscribeForContextChange();
        this.subscribeForTimeRangeChange();
        if (pageParams.editMode && this.hasWritePermission) {
          this.fetchMetricTypes();
          this.enableEditMode();
        }
      });
    });
  }

  triggerRefresh() {
    const refreshRanger = this.timeRangeSelection.type === 'RELATIVE';
    if (refreshRanger) {
      const newTimeRange = TimeSeriesUtils.convertSelectionToTimeRange(this.timeRangeSelection);
      this.updateFullAndSelectedRange(newTimeRange);
    }
    this.refreshAllCharts(refreshRanger);
  }

  /**
   * If the current selection is full, this method will preserve the full selection, no matter of the new range.
   * If there is a custom selection, it will try to be preserved, cropping it if needed.
   * If the current selection does not fit into the new range, the full selection will be set instead
   */
  updateFullAndSelectedRange(fullRange: TimeRange) {
    const isFullRangeSelected = this.context.isFullRangeSelected();
    if (isFullRangeSelected) {
      this.context.updateFullRange(fullRange, false);
      this.context.updateSelectedRange(fullRange, false);
    } else {
      let newSelection = this.context.getSelectedTimeRange();
      // we crop it
      const newFrom = Math.max(fullRange.from!, newSelection.from!);
      const newTo = Math.min(fullRange.to!, newSelection.to!);
      if (newTo - newFrom < 3) {
        newSelection = fullRange; // zoom reset when the interval is very small
      } else {
        newSelection = { from: newFrom, to: newTo };
      }
      this.context.updateFullRange(fullRange, false);
      this.context.updateSelectedRange(newSelection, false);
    }
  }

  handleRefreshIntervalChange(interval: number) {
    this.refreshInterval = interval;
    this.updateUrl();
    this.triggerRefresh();
  }

  handleResolutionChange(resolution: number) {
    if (resolution > 0 && resolution < 1000) {
      // minimum value should be one second
      return;
    }
    this.context.updateChartsResolution(resolution);
  }

  private updateUrl(): void {
    this._urlParamsService.updateUrlParams(this.context, this.timeRangeSelection, this.refreshInterval);
  }

  ngOnDestroy(): void {
    this._timeSeriesContextFactory?.destroyContext(this.context?.id);
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
    this.dashboard.refreshInterval = this.refreshInterval;
    this.dashboard.resolution = this.resolution;
    this.dashboard.filters =
      this.filterBar?._internalFilters.map((item) => {
        const apiFilter = FilterUtils.convertToApiFilterItem(item);
        apiFilter.removable = false; // make all the fields not removable once saved
        return apiFilter;
      }) || [];

    this._dashboardService.saveDashboard(this.dashboard).subscribe((response) => {});
  }

  addDashlet(metric: MetricType) {
    const newDashlet: DashboardItem = {
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
    this.filterBar!.addUniqueFilterItems(
      newDashlet.chartSettings!.attributes.map((item) => FilterUtils.createFilterItemFromAttribute(item)),
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

  private convertUrlFilters(
    urlParams: DashboardUrlParams,
    attributesDefinition: Record<string, MetricAttribute>,
  ): FilterBarItem[] {
    return urlParams.filters
      .filter((i) => !!attributesDefinition[i.attribute])
      .map((urlFilter) => {
        const filterItem = FilterUtils.createFilterItemFromAttribute(attributesDefinition[urlFilter.attribute]);
        switch (filterItem.type) {
          case FilterBarItemType.OPTIONS:
            urlFilter.values?.forEach((v) => {
              let foundOptions = filterItem.textValues?.find((textValue) => textValue.value === v);
              if (foundOptions) {
                foundOptions.isSelected = true;
              } else {
                filterItem.textValues?.push({ value: v, isSelected: true });
              }
            });
            filterItem.exactMatch = true;
            break;
          case FilterBarItemType.FREE_TEXT:
            filterItem.freeTextValues = urlFilter.values;
            break;
          case FilterBarItemType.EXECUTION:
          case FilterBarItemType.TASK:
          case FilterBarItemType.PLAN:
            filterItem.exactMatch = true;
            filterItem.searchEntities = urlFilter.values?.map((v) => ({ searchValue: v, entity: undefined })) || [];
            break;
          case FilterBarItemType.NUMERIC:
          case FilterBarItemType.DATE:
            filterItem.min = urlFilter.min;
            filterItem.max = urlFilter.max;
            break;
        }
        return filterItem;
      });
  }

  createContext(dashboard: DashboardView, urlParams: DashboardUrlParams): TimeSeriesContext {
    const timeRangeSelection = urlParams.timeRange || dashboard.timeRange!;
    const timeRange: TimeRange = this.getTimeRangeFromTimeSelection(timeRangeSelection);
    if (timeRangeSelection.type === 'RELATIVE') {
      const timeInMs = timeRangeSelection.relativeSelection!.timeInMs;
      const foundRelativeOption = this.timeRangeOptions.find((o) => {
        return timeInMs === o.relativeSelection?.timeInMs;
      });
      this.timeRangeSelection = foundRelativeOption || {
        type: 'RELATIVE',
        relativeSelection: {
          label: timeRangeSelection.relativeSelection!.label || `Last ${timeInMs / 60000} minutes`,
          timeInMs: timeInMs,
        },
      };
    } else {
      // absolute
      this.timeRangeSelection = { ...timeRangeSelection, type: timeRangeSelection.type! };
    }
    const metricAttributes: MetricAttribute[] = this.dashboard.dashlets.flatMap(
      (d) => d.chartSettings?.attributes || [],
    );
    const urlFilters = FilterUtils.convertUrlKnownFilters(urlParams.filters, metricAttributes).filter(
      FilterUtils.filterItemIsValid,
    );

    // url filters are excluded from the dashboard filters
    const dashboardFilters = dashboard.filters
      ?.map(FilterUtils.convertApiFilterItem)
      .filter((filter) => !urlFilters.find((f) => f.attributeName === filter.attributeName));
    return this._timeSeriesContextFactory.createContext({
      id: dashboard.id!,
      timeRange: timeRange,
      attributes: metricAttributes,
      grouping: urlParams.grouping || dashboard.grouping || [],
      filters: [...urlFilters, ...dashboardFilters],
      resolution: urlParams.resolution,
    });
  }

  subscribeForContextChange(): void {
    merge(this.context.onFilteringChange(), this.context.onGroupingChange(), this.context.onChartsResolutionChange())
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.refreshAllCharts(false, true);
      });
  }

  private getContext(compare: boolean): TimeSeriesContext {
    return this.context;
  }

  private subscribeForTimeRangeChange(compareCharts = false) {
    const context = this.getContext(compareCharts);
    context
      .onTimeSelectionChange()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.refreshAllCharts(false, true));
  }

  /**
   * @param refreshRanger. Set true if ranger data has to be updated
   * @param force. If set to false (default), the refresh will be skipped if there is a refresh in progress.
   * @private
   */
  private refreshAllCharts(refreshRanger = false, force = false): void {
    if (this.refreshInProgress && !force) {
      return;
    }
    this.refreshSubscription?.unsubscribe();
    this.refreshInProgress = true;
    this.refreshSubscription = of(null)
      .pipe(
        tap(() => (this.refreshInProgress = true)),
        switchMap(() => {
          const dashlets$ = this.dashlets?.map((dashlet) => dashlet.refresh());
          if (refreshRanger) {
            dashlets$.push(this.refreshRanger());
          }
          return forkJoin(dashlets$).pipe(defaultIfEmpty([]));
        }),
        tap(() => (this.refreshInProgress = false)),
      )
      .subscribe();
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

  /**
   * Handle full range interval changes, not selection changes.
   */
  handleTimeRangeChange(params: { selection: TimeRangePickerSelection; triggerRefresh: boolean }) {
    this.timeRangeSelection = params.selection;
    let range = this.getTimeRangeFromTimeSelection(params.selection);
    this.context.updateFullRange(range, false);
    this.context.updateSelectedRange(range, false);
    this.refreshRanger().subscribe();
    this.refreshAllCharts(true, true);
  }

  private refreshRanger(): Observable<TimeSeriesAPIResponse> {
    return this.filterBar!.timeSelection!.refreshRanger();
  }

  collectAllAttributes(): MetricAttribute[] {
    return this.dashboard.dashlets.flatMap((d) => d.chartSettings!.attributes);
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
}
