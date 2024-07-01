import {
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  AugmentedTimeSeriesService,
  AuthService,
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
  TimeRangePickerComponent,
  TimeRangePickerSelection,
  TimeSeriesConfig,
  TimeSeriesContext,
  TimeSeriesContextsFactory,
  TsFilteringMode,
  TsFilteringSettings,
} from '../../modules/_common';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  DashboardUrlParams,
  DashboardUrlParamsService,
} from '../../modules/_common/injectables/dashboard-url-params.service';
import { TableDashletComponent } from '../table-dashlet/table-dashlet.component';
import { TableColumnType } from '../../modules/_common/types/table-column-type';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';
import { DashboardStateEngine } from './dashboard-state-engine';
import { forkJoin, map, Observable, tap } from 'rxjs';

//@ts-ignore
import uPlot = require('uplot');
import { DashboardState } from './dashboard-state';
import { TimeSeriesEntityService } from '../../modules/_common/injectables/time-series-entity.service';
import { StateTest } from './state.test';
import { TimeRangeType } from './time-range-type';

@Component({
  selector: 'step-timeseries-dashboard',
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
export class DashboardComponent implements OnInit, OnDestroy, OnChanges {
  readonly DASHLET_HEIGHT = 300;

  @ViewChildren('chart') dashlets!: QueryList<ChartDashlet>;
  @ViewChildren('compareChart') compareDashlets!: QueryList<ChartDashlet>;
  @ViewChild('filterBar') filterBar?: DashboardFilterBarComponent;
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
  private _destroyRef = inject(DestroyRef);

  @Input('id') dashboardId!: string;
  @Input() editable: boolean = true;
  @Input() hiddenFilters: FilterBarItem[] = [];
  @Input() defaultFullTimeRange?: Partial<TimeRange>;
  @Input() showExecutionLinks = true;
  @Input() showRefreshOption = true;
  @Input() showDashboardName = true;
  @Input() showHeaderBar = true; // if false, the settings button will be shifted out of the component

  private exportInProgress = false;
  dashboard!: DashboardView;
  dashboardBackup!: DashboardView;
  refreshInterval: number = 0;

  compareModeEnabled = false;
  timeRangeOptions: TimeRangePickerSelection[] = [...TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS];
  resolution?: number;

  editMode = false;
  metricTypes?: MetricType[];

  hasWritePermission = false;

  mainEngine!: DashboardStateEngine;
  compareEngine?: DashboardStateEngine;

  ngOnInit(): void {
    if (!this.dashboardId) {
      throw new Error('Dashboard id input is mandatory');
    }
    if (this.defaultFullTimeRange?.from) {
      this.timeRangeOptions.push({ type: 'FULL' });
    }
    const pageParams: DashboardUrlParams = this._urlParamsService.collectUrlParams();
    this.resolution = pageParams.resolution;
    this.removeOneTimeUrlParams();
    this.hasWritePermission = this._authService.hasRight('dashboard-write');
    const metrics$ = this._timeSeriesService.getMetricTypes();
    const dashboard$ = this._dashboardService.getDashboardById(this.dashboardId);
    forkJoin([metrics$, dashboard$]).subscribe(([metrics, dashboard]) => {
      this.metricTypes = metrics;
      this.initState(pageParams, dashboard);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    let fullTimeRangeChange = changes['defaultFullTimeRange'];
    if (
      fullTimeRangeChange &&
      fullTimeRangeChange.previousValue !== fullTimeRangeChange.currentValue &&
      !fullTimeRangeChange.firstChange
    ) {
      this.mainEngine?.state.context.updateDefaultFullTimeRange(fullTimeRangeChange.currentValue);
      this.compareEngine?.state.context.updateDefaultFullTimeRange(fullTimeRangeChange.currentValue);
    }
  }

  /**
   * Parameters of the dashboard are combined from 3 places, in the following order:
   * 1. URL
   * 2. Stored state
   * 3. Dashboard object
   */
  initState(pageParams: DashboardUrlParams, dashboard: DashboardView): void {
    this.dashboard = dashboard;
    // this.refreshInterval =
    //   (pageParams.refreshInterval !== undefined ? pageParams.refreshInterval : this.dashboard.refreshInterval) || 0;
    // this.resolution = pageParams.resolution || this.dashboard.resolution;
    // pageParams.resolution = this.resolution;
    const existingContext: TimeSeriesContext = StateTest.contexts[this.dashboardId];
    const hasCustomSelection = existingContext?.isFullRangeSelected();
    const existingCustomSelection = hasCustomSelection ? existingContext!.getSelectedTimeRange() : undefined;
    const timeRangeSelection = this.computeTimeRange(existingCustomSelection, dashboard, pageParams);
    const context = existingContext || this.createContext(this.dashboard, pageParams, timeRangeSelection);
    this.resolution = context.getChartsResolution();
    this.refreshInterval = context.getRefreshInterval();
    StateTest.contexts[this.dashboardId] = context;
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

    if (pageParams.editMode && this.hasWritePermission && this.editable) {
      this.enableEditMode();
    }
  }

  public refresh() {
    if (!this.compareModeEnabled) {
      this.mainEngine.triggerRefresh(false);
      this.compareEngine?.triggerRefresh(false);
    }
  }

  onDashboardNameChange(name: string) {
    if (!name) {
      this.dashboard.attributes!['name'] = 'Unnamed';
      return;
    }
    this.dashboard.attributes!['name'] = name;
    const modifiedDashboard = this.editMode ? this.dashboardBackup! : this.dashboard;
    this._dashboardService.saveDashboard(modifiedDashboard).subscribe();
  }

  handleDashboardDescriptionChange(description: string) {
    const modifiedDashboard = this.editMode ? this.dashboardBackup! : this.dashboard;
    modifiedDashboard.description = description;
    this._dashboardService.saveDashboard(modifiedDashboard).subscribe();
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
      inheritSpecificFiltersOnly: false,
      specificFiltersToInherit: [],
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

  private getTimeRangeFromTimeSelection(selection: TimeRangeSelection): TimeRange {
    switch (selection.type) {
      case 'ABSOLUTE':
        return { from: selection.absoluteSelection!.from!, to: selection.absoluteSelection!.to! };
      case 'RELATIVE':
        let now = new Date().getTime();
        return { from: now - selection.relativeSelection!.timeInMs!, to: now };
      case 'FULL':
        return { from: this.defaultFullTimeRange!.from!, to: this.defaultFullTimeRange!.to || new Date().getTime() };
      default:
        throw new Error('Unsupported time selection type: ' + selection.type);
    }
  }

  private computeTimeRange(
    existingCustomSelection: TimeRange | undefined,
    dashboard: DashboardView,
    urlParams: DashboardUrlParams,
  ): TimeRangeSelection {
    if (existingCustomSelection) {
      return { type: 'ABSOLUTE', absoluteSelection: existingCustomSelection };
    }
    // priority of time ranges property: 1. existingCustomSelection 2. URL 3. Default full selection 4. Dashboard
    if (!urlParams.timeRange && this.defaultFullTimeRange?.from) {
      return {
        type: 'FULL',
        absoluteSelection: {
          from: this.defaultFullTimeRange!.from,
          to: this.defaultFullTimeRange!.to || new Date().getTime(),
        },
      };
    }
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
    } else if (timeRangeSelection.type === 'ABSOLUTE') {
      // absolute
      timeRangeSelection = { ...timeRangeSelection, type: timeRangeSelection.type! };
    } else {
      // FULL
      timeRangeSelection = { type: 'FULL' };
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

    const visibleFilters: FilterBarItem[] = this.mergeAndExcludeHiddenFilters(
      urlFilters,
      dashboard.filters,
      this.hiddenFilters,
    );
    this.fetchFilterEntities(visibleFilters);
    return this._timeSeriesContextFactory.createContext({
      id: dashboard.id!,
      dashlets: this.dashboard.dashlets,
      timeRangeSettings: {
        type: timeRangeSelection.type as TimeRangeType,
        defaultFullRange: this.defaultFullTimeRange,
        fullRange: timeRange,
        relativeSelection: timeRangeSelection.relativeSelection,
        selectedRange: urlParams.selectedTimeRange || timeRange,
      },
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
    });
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

  private fetchFilterEntities(items: FilterBarItem[]): void {
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
    this.fetchAllEntities(entitiesByAttributes).subscribe((indexedEntities) => {
      entityFilterItems.forEach((item) => {
        const entitiesByType = indexedEntities[item.attributeName];
        item.searchEntities.forEach((entity) => {
          if (entity.searchValue && !entity.entity) {
            entity.entity = entitiesByType[entity.searchValue];
          }
        });
      });
    });
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

  private createCompareModeFilters() {
    const clonedSettings: TsFilteringSettings = JSON.parse(
      JSON.stringify(this.mainEngine.state.context.getFilteringSettings()),
    );
    clonedSettings.filterItems.forEach((item) => (item.isHidden = false)); // make everything visible in compare mode
    return clonedSettings;
  }

  enableCompareMode() {
    const mainState = this.mainEngine.state;
    const timeRange = JSON.parse(JSON.stringify(mainState.context.getFullTimeRange()));
    const compareModeContext = this._timeSeriesContextFactory.createContext({
      dashlets: JSON.parse(JSON.stringify(this.dashboard.dashlets)), // clone
      timeRangeSettings: JSON.parse(JSON.stringify(mainState.context.getTimeRangeSettings())),
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
    const currentParams = { ...this._route.snapshot.queryParams };
    currentParams[TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX + 'edit'] = null;

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
    // this._timeSeriesContextFactory.destroyContext(this.mainEngine.state.context.id);
    // this._timeSeriesContextFactory.destroyContext(this.compareEngine?.state.context.id);
    this.mainEngine?.destroy();
    this.compareEngine?.destroy();
  }
}
