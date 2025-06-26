import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  input,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  AugmentedTimeSeriesService,
  AuthService,
  type ColumnSelection,
  DashboardItem,
  DashboardsService,
  DashboardView,
  Execution,
  ExecutiontTaskParameters,
  MetricAttribute,
  MetricType,
  Plan,
  TimeRange,
  TimeRangeSelection,
  TimeSeriesFilterItem,
} from '@exense/step-core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterUtils,
  ResolutionPickerComponent,
  TimeSeriesConfig,
  TimeSeriesContext,
  TimeSeriesContextsFactory,
  TimeSeriesUtils,
  TsFilteringMode,
  TsFilteringSettings,
  TsGroupingComponent,
} from '../../modules/_common';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { DashboardFilterBarComponent, PerformanceViewTimeSelectionComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  DashboardUrlParams,
  DashboardUrlParamsService,
} from '../../modules/_common/injectables/dashboard-url-params.service';
import { TableDashletComponent } from '../table-dashlet/table-dashlet.component';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';
import { DashboardStateEngine } from './dashboard-state-engine';
import { filter, forkJoin, map, Observable, of, tap } from 'rxjs';

//@ts-ignore
import uPlot = require('uplot');
import { DashboardState } from './dashboard-state';
import { TimeSeriesEntityService } from '../../modules/_common';
import { DashboardTimeRangeSettings } from './dashboard-time-range-settings';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';
import { TimeRangePickerComponent } from '../../modules/_common/components/time-range-picker/time-range-picker.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'step-timeseries-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DashboardUrlParamsService],
  imports: [
    COMMON_IMPORTS,
    DashboardFilterBarComponent,
    ChartDashletComponent,
    TimeRangePickerComponent,
    TableDashletComponent,
    PerformanceViewTimeSelectionComponent,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly DASHLET_HEIGHT = 300;

  @ViewChildren('chart') dashlets!: QueryList<ChartDashlet>;
  @ViewChildren('compareChart') compareDashlets!: QueryList<ChartDashlet>;
  @ViewChild('filterBar') filterBar?: DashboardFilterBarComponent;
  @ViewChild('timeSelection') timeRanger?: PerformanceViewTimeSelectionComponent;
  @ViewChild('compareTimeSelection') compareTimeRanger?: PerformanceViewTimeSelectionComponent;
  @ViewChild('compareFilterBar') compareFilterBar?: DashboardFilterBarComponent;
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;

  private _timeSeriesService = inject(AugmentedTimeSeriesService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  private _timeSeriesContextFactory = inject(TimeSeriesContextsFactory);
  private _dashboardService = inject(DashboardsService);
  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _router: Router = inject(Router);
  private _authService: AuthService = inject(AuthService);
  private _urlParamsService: DashboardUrlParamsService = inject(DashboardUrlParamsService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);

  id = input.required<string>(); // dashboard id
  @Input() storageId?: string; // for persistence across views
  @Input() editable: boolean = true;
  @Input() hiddenFilters: FilterBarItem[] = [];
  @Input() showExecutionLinks = true;
  timeRange = input.required<TimeRange>();

  timeRangeOptions = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;

  fullRangeSelected: boolean = true;

  timeRangeChangeEffect = effect(() => {
    const timeRange = this.timeRange()!;
    this.mainEngine?.state.context.updateFullTimeRange(timeRange);
    // this.compareEngine?.state.context.updateFullTimeRange(timeRange);
    this.refresh();
  });

  /** @Output **/
  readonly contextSettingsChanged = output<TimeSeriesContext>(); // used to detect any change, useful for url updates
  readonly contextSettingsInit = output<TimeSeriesContext>(); // emit only first time when the context is created
  readonly zoomChange = output<TimeRange>();
  readonly zoomReset = output<void>();
  readonly fullRangeUpdateRequest = output<TimeRange>();
  readonly dashboardUpdate = output<DashboardView>();

  private exportInProgress = false;
  dashboard!: DashboardView;
  dashboardBackup!: DashboardView;

  compareModeEnabled = false;
  resolution?: number;

  editMode = false;
  metricTypes?: MetricType[];

  hasWritePermission = false;

  mainEngine!: DashboardStateEngine;
  compareEngine?: DashboardStateEngine;

  ngOnInit(): void {
    const dashboardId = this.id();
    const urlParams: DashboardUrlParams = this._urlParamsService.collectUrlParams();
    this.resolution = urlParams.resolution;
    this.removeOneTimeUrlParams();
    this.hasWritePermission = this._authService.hasRight('dashboard-write');
    const metrics$ = this._timeSeriesService.getMetricTypes();
    const dashboard$ = this._dashboardService.getDashboardById(dashboardId);
    forkJoin([metrics$, dashboard$]).subscribe(([metrics, dashboard]) => {
      this.metricTypes = metrics;
      this.initState(urlParams, dashboard).subscribe((context) => this.contextSettingsInit.emit(context));
    });
  }

  updateTimeRangeFromSelection() {
    if (!this.fullRangeSelected) {
      this.fullRangeUpdateRequest.emit(this.mainEngine.state.context.getSelectedTimeRange());
    }
  }

  public getSelectedTimeRange(): TimeRange {
    return this.mainEngine.state.context.timeRangeSettings.selectedRange;
  }

  handleMainFullRangeChange(range: TimeRange) {
    this.fullRangeUpdateRequest.emit(range);
  }

  handleCompareFullRangeChange(range: TimeRange) {
    this.compareEngine?.state.context.updateFullRangeAndSelection(range);
  }

  /**
   * Parameters of the dashboard are combined from 3 places, in the following order:
   * 1. URL
   * 2. Stored state
   * 3. Dashboard object
   */
  initState(urlParams: DashboardUrlParams, dashboard: DashboardView): Observable<TimeSeriesContext> {
    this.dashboard = dashboard;
    const existingContext = this.storageId ? this._timeSeriesContextFactory.getContext(this.storageId) : undefined;
    const context$: Observable<TimeSeriesContext> = existingContext
      ? of(existingContext)
      : this.createContext(this.dashboard, urlParams, existingContext);
    return context$.pipe(
      tap((context) => {
        this.initStateFromContext(context, urlParams?.editMode);
        context.settingsChange$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
          this.contextSettingsChanged.emit(context);
          this.fullRangeSelected = context.isFullRangeSelected();
        });
        this.contextSettingsInit.emit(context);
        context.onTimeSelectionChange().subscribe((range) => {
          this.zoomChange.emit(range);
        });
      }),
    );
  }

  handleZoomReset() {
    this.zoomReset.emit();
    this.mainEngine.state.context.resetZoom();
  }

  private initStateFromContext(context: TimeSeriesContext, editMode?: boolean) {
    this.resolution = context.getChartsResolution();
    const state: DashboardState = {
      context: context,
      getFilterBar: () => this.filterBar!,
      getDashlets: () => this.dashlets,
      getRanger: () => this.timeRanger!,
      refreshInProgress: false,
    };
    this.mainEngine = new DashboardStateEngine(state);
    this.mainEngine.subscribeForContextChange();

    if (editMode && this.hasWritePermission && this.editable) {
      this.enableEditMode();
    }
  }

  public refresh() {
    if (!this.compareModeEnabled && this.mainEngine) {
      this.mainEngine.triggerRefresh(false);
      this.compareEngine?.triggerRefresh(false);
    }
  }

  handleResolutionChange(resolution: number) {
    if (resolution > 0 && resolution < 1000) {
      // minimum value should be one second
      return;
    }
    this.mainEngine.state.context.updateChartsResolution(resolution);
    this.compareEngine?.state.context.updateChartsResolution(resolution);
  }

  enableEditMode() {
    this.dashboardBackup = JSON.parse(JSON.stringify(this.dashboard));
    this.editMode = true;
  }

  cancelEditMode() {
    this.dashboard = { ...this.dashboardBackup };
    this.editMode = false;
  }

  saveEditChanges() {
    this.editMode = false;
    this.dashboard.grouping = this.mainEngine.state.context.getGroupDimensions();
    // this.dashboard.timeRange = this.mainEngine.state.context.getTimeRangeSettings().pickerSelection;
    this.dashboard.resolution = this.resolution;
    this.dashboard.filters =
      this.filterBar?._internalFilters.map((item) => {
        const apiFilter = FilterUtils.convertToApiFilterItem(item);
        apiFilter.removable = false; // make all the fields not removable once saved
        return apiFilter;
      }) || [];

    this.dashboardUpdate.emit(this.dashboard);
    // this._dashboardService.saveDashboard(this.dashboard).subscribe((response) => {});
    // this.mainEngine.refreshAllCharts(false, true);
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
      inheritSpecificFiltersOnly: false,
      specificFiltersToInherit: [],
      tableSettings: { columns: this.getInitialTableColumns() },
    };
    this.filterBar!.addUniqueFilterItems(
      tableItem.attributes.map((attribute) => FilterUtils.createFilterItemFromAttribute(attribute)),
    );
    this.dashboard.dashlets.push(tableItem);
    this.mainEngine.state.context.updateDashlets(this.dashboard.dashlets);
  }

  private getInitialTableColumns(): ColumnSelection[] {
    return [
      { selected: true, column: 'COUNT', aggregation: { type: ChartAggregation.COUNT } },
      { selected: true, column: 'SUM', aggregation: { type: ChartAggregation.SUM } },
      { selected: true, column: 'AVG', aggregation: { type: ChartAggregation.AVG } },
      { selected: true, column: 'MIN', aggregation: { type: ChartAggregation.MIN } },
      { selected: true, column: 'MAX', aggregation: { type: ChartAggregation.MAX } },
      { selected: true, column: 'PCL_1', aggregation: { type: ChartAggregation.PERCENTILE, params: { pclValue: 80 } } },
      { selected: true, column: 'PCL_2', aggregation: { type: ChartAggregation.PERCENTILE, params: { pclValue: 90 } } },
      { selected: true, column: 'PCL_3', aggregation: { type: ChartAggregation.PERCENTILE, params: { pclValue: 99 } } },
      { selected: true, column: 'TPS', aggregation: { type: ChartAggregation.RATE, params: { rateUnit: 's' } } },
      { selected: true, column: 'TPH', aggregation: { type: ChartAggregation.RATE, params: { rateUnit: 'h' } } },
    ];
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
      inheritSpecificFiltersOnly: false,
      specificFiltersToInherit: [],
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

  private computeTimeRangeSettings(
    existingSettings: DashboardTimeRangeSettings | undefined,
    urlParams: DashboardUrlParams,
  ): DashboardTimeRangeSettings {
    // priority of time ranges property: 1. URL, 2. existingCustomSelection 3. Default full selection
    if (existingSettings) {
      return existingSettings!;
    } else {
      return {
        fullRange: this.timeRange()!,
        selectedRange: urlParams.selectedTimeRange || this.timeRange()!,
      };
    }
  }

  createContext(
    dashboard: DashboardView,
    urlParams: DashboardUrlParams,
    existingContext?: TimeSeriesContext,
  ): Observable<TimeSeriesContext> {
    const timeRangeSettings: DashboardTimeRangeSettings = this.computeTimeRangeSettings(
      existingContext?.getTimeRangeSettings(),
      urlParams,
    );
    const metricAttributes: MetricAttribute[] = this.dashboard.dashlets.flatMap((d) => d.attributes || []);
    const urlFilters = FilterUtils.convertUrlKnownFilters(urlParams.filters, metricAttributes).filter(
      FilterUtils.filterItemIsValid,
    );

    const visibleFilters: FilterBarItem[] = this.mergeAndExcludeHiddenFilters(
      urlFilters,
      dashboard.filters,
      this.hiddenFilters,
    );
    return this.fetchFilterEntities(visibleFilters).pipe(
      map((empty) => {
        return this._timeSeriesContextFactory.createContext(
          {
            id: dashboard.id!,
            dashlets: this.dashboard.dashlets,
            timeRangeSettings: timeRangeSettings,
            selectedTimeRange: urlParams.selectedTimeRange,
            attributes: metricAttributes,
            grouping: urlParams.grouping || dashboard.grouping || [],
            filteringSettings: {
              mode: TsFilteringMode.STANDARD,
              filterItems: visibleFilters,
              hiddenFilters: this.hiddenFilters,
            },
            resolution: this.resolution,
            metrics: this.metricTypes,
            refreshInterval:
              urlParams.refreshInterval !== undefined ? urlParams.refreshInterval : this.dashboard.refreshInterval,
          },
          this.storageId,
        );
      }),
    );
  }

  private mergeAndExcludeHiddenFilters(
    urlFilters: FilterBarItem[],
    dashboardFilters: TimeSeriesFilterItem[],
    hiddenFilters: FilterBarItem[],
  ): FilterBarItem[] {
    // url filters are excluded from the dashboard filters
    const dashboardConvertedFilters =
      dashboardFilters
        ?.filter((filter) => {
          const foundUrlFilter = urlFilters.find((f) => f.attributeName === filter.attribute);
          if (foundUrlFilter) {
            foundUrlFilter.removable = filter.removable; // keep the removable flag when deleting duplicates
          }
          return !foundUrlFilter;
        })
        ?.map(FilterUtils.convertApiFilterItem) || [];
    let visibleFilters = [...urlFilters, ...dashboardConvertedFilters];
    hiddenFilters.forEach((f) => {
      f.isHidden = true;
      visibleFilters = visibleFilters.filter((v) => v.attributeName !== f.attributeName);
    });
    return visibleFilters;
  }

  private fetchFilterEntities(items: FilterBarItem[]): Observable<any> {
    const entitiesByAttributes: Record<string, string[]> = {};
    const entityFilterItems = items.filter((item) => item.searchEntities?.length);
    entityFilterItems.forEach((item) => {
      item.searchEntities.forEach((entity) => {
        if (entity.searchValue && !entity.entity) {
          const existingEntitiesForAttribute = entitiesByAttributes[item.attributeName] || [];
          existingEntitiesForAttribute.push(entity.searchValue);
          entitiesByAttributes[item.attributeName] = existingEntitiesForAttribute;
        }
      });
    });
    if (entityFilterItems.length === 0) {
      return of(undefined);
    }
    return this.fetchAllEntities(entitiesByAttributes).pipe(
      tap((indexedEntities) => {
        entityFilterItems.forEach((item) => {
          const entitiesByType = indexedEntities[item.attributeName];
          item.searchEntities.forEach((entity) => {
            if (entity.searchValue && !entity.entity) {
              entity.entity = entitiesByType[entity.searchValue];
            }
          });
        });
      }),
    );
  }

  /**
   * This method will grab all the entities using different requests for each required type. the result is merged and grouped into
   * an indexed object: first level by entity type (exec/plan/task), and then each entity by its id.
   */
  private fetchAllEntities(
    entitiesByAttributes: Record<string, string[]>,
  ): Observable<Record<string, Record<string, Execution | Plan | ExecutiontTaskParameters>>> {
    const requests$: Observable<(Execution | Plan | ExecutiontTaskParameters)[]>[] = [];
    const requestsAttributes: string[] = [];
    Object.keys(entitiesByAttributes).forEach((attribute) => {
      requestsAttributes.push(attribute);
      switch (attribute) {
        case TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE:
          requests$.push(
            this._timeSeriesEntityService.getExecutions(entitiesByAttributes[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE]),
          );
          break;
        case TimeSeriesConfig.PLAN_ID_ATTRIBUTE:
          requests$.push(
            this._timeSeriesEntityService.getPlans(entitiesByAttributes[TimeSeriesConfig.PLAN_ID_ATTRIBUTE]),
          );
          break;
        case TimeSeriesConfig.TASK_ID_ATTRIBUTE:
          requests$.push(
            this._timeSeriesEntityService.getTasks(entitiesByAttributes[TimeSeriesConfig.TASK_ID_ATTRIBUTE]),
          );
          break;
        default:
          throw new Error('Unhandled entities by attribute: ' + attribute);
      }
    });
    return forkJoin(requests$).pipe(
      map((responses) => {
        const indexedEntities: Record<string, Record<string, Execution | Plan | ExecutiontTaskParameters>> = {};
        requestsAttributes.forEach((entity, i) => {
          // indexed by entity type, then by id

          const response = responses[i];
          indexedEntities[entity] = response.reduce(
            (obj: Record<string, any>, current: Execution | Plan | ExecutiontTaskParameters) => {
              obj[current.id!] = current;
              return obj;
            },
            {} as Record<string, any>,
          );
        });
        return indexedEntities;
      }),
    );
  }

  handleChartDelete(index: number) {
    const itemToDelete = this.dashboard.dashlets[index];
    this.dashboard.dashlets.splice(index, 1);
    this.mainEngine.state.context.updateAttributes(this.collectAllAttributes());
    if (itemToDelete.type === 'TABLE') {
      this.dashboard.dashlets
        .filter((dashboardItem) => dashboardItem.masterChartId === itemToDelete.id)
        .forEach((dashboardItem) => (dashboardItem.masterChartId = undefined));
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

  private createCompareModeFilters() {
    const clonedSettings: TsFilteringSettings = JSON.parse(
      JSON.stringify(this.mainEngine.state.context.getFilteringSettings()),
    );
    const hiddenFilters = clonedSettings.hiddenFilters || [];
    clonedSettings.filterItems = [...hiddenFilters, ...clonedSettings.filterItems]; // make everything visible in compare mode
    clonedSettings.filterItems.forEach((item) => {
      item.isHidden = false;
      item.updateTimeSelectionOnFilterChange = true;
      if (item.attributeName === TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE) {
        item.menuOpenOnInit = FilterUtils.filterItemIsValid(item); // if there is an execution filter, we open the menu in compare for a faster comparison
        item.textValues = [];
        item.searchEntities = [];
        item.freeTextValues = [];
      }
    });
    clonedSettings.hiddenFilters = [];
    return clonedSettings;
  }

  enableCompareMode() {
    const mainState = this.mainEngine.state;
    const mainTimeSettings = mainState.context.getTimeRangeSettings();
    const compareModeContext = this._timeSeriesContextFactory.createContext({
      dashlets: JSON.parse(JSON.stringify(this.dashboard.dashlets)), // clone
      timeRangeSettings: {
        timeRangeSelection: { type: 'ABSOLUTE', absoluteSelection: mainTimeSettings.fullRange },
        fullRange: mainTimeSettings.fullRange,
        selectedRange: mainTimeSettings.selectedRange,
      },
      id: new Date().getTime().toString(),
      attributes: this.mainEngine.state.context.getAllAttributes(),
      grouping: mainState.context.getGroupDimensions(),
      filteringSettings: this.createCompareModeFilters(),
      colorsPool: mainState.context.colorsPool,
      syncGroups: mainState.context.getSyncGroups(),
      resolution: mainState.context.getChartsResolution(),
      metrics: this.metricTypes,
    });
    const state: DashboardState = {
      context: compareModeContext,
      getDashlets: () => this.compareDashlets,
      getFilterBar: () => this.compareFilterBar!,
      getRanger: () => this.compareTimeRanger!,
      refreshInProgress: false,
    };
    compareModeContext.settingsChange$.subscribe(() => {
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
    const currentParams = { ...this._route.snapshot.queryParams };
    currentParams[TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX + 'edit'] = null;

    this._router.navigate([], {
      relativeTo: this._route,
      replaceUrl: true,
      queryParams: currentParams,
      queryParamsHandling: 'merge',
    });
  }

  resetDashboard() {
    this._timeSeriesContextFactory.destroyContext(this.storageId);
    this.dashboard = undefined as any;
    this.dashboardBackup = undefined as any;
    this.compareModeEnabled = false;
    this.resolution = undefined;
    this.mainEngine = undefined as any;
    this.compareEngine = undefined;

    this._changeDetectorRef.detectChanges();

    this._dashboardService.getDashboardById(this.id()).subscribe((dashboard) => {
      this.initState({ filters: [] }, dashboard).subscribe((context) => this.contextSettingsChanged.emit(context));
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
    this.mainEngine?.destroy();
    this.compareEngine?.destroy();
    if (!this.storageId) {
      this.mainEngine.state.context.destroy();
      this.compareEngine?.state.context.destroy();
    }
  }
}
