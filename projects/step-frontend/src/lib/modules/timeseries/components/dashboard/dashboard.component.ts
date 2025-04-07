import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
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
} from '../../modules/_common';
import { TimeRangeRelativeSelection } from '@exense/step-core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
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
import { TimeRangePickerSelection } from '../../modules/_common/types/time-selection/time-range-picker-selection';
import { DashboardViewSettingsBtnLocation } from './dashboard-view-settings-btn-location';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

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
    MatProgressSpinner,
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
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);

  @Input('id') dashboardId!: string;
  @Input() storageId?: string;
  @Input() editable: boolean = true;
  @Input() hiddenFilters: FilterBarItem[] = [];
  @Input() defaultFullTimeRange?: Partial<TimeRange>;
  @Input() showExecutionLinks = true;
  @Input() showRefreshOption = true;
  @Input() showDashboardName = true;
  @Input() showHeaderBar = true;
  @Input() settingsButtonPosition: DashboardViewSettingsBtnLocation = DashboardViewSettingsBtnLocation.HEADER_BAR;

  SETTINGS_LOCATION = DashboardViewSettingsBtnLocation;

  @Output() timeRangeChange = new EventEmitter<TimeRangePickerSelection>();

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
      // for running executions we don't have the end time, setting to 0 instead.
      this.timeRangeOptions.unshift({
        type: 'FULL',
        absoluteSelection: { from: this.defaultFullTimeRange.from, to: this.defaultFullTimeRange.to || 0 },
      });
    }
    const urlParams: DashboardUrlParams = this._urlParamsService.collectUrlParams();
    this.resolution = urlParams.resolution;
    this.removeOneTimeUrlParams();
    this.hasWritePermission = this._authService.hasRight('dashboard-write');
    const metrics$ = this._timeSeriesService.getMetricTypes();
    const dashboard$ = this._dashboardService.getDashboardById(this.dashboardId);
    forkJoin([metrics$, dashboard$]).subscribe(([metrics, dashboard]) => {
      this.metricTypes = metrics;
      this.initState(urlParams, dashboard);
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
  initState(urlParams: DashboardUrlParams, dashboard: DashboardView): void {
    this.dashboard = dashboard;
    const existingContext = this.storageId ? this._timeSeriesContextFactory.getContext(this.storageId) : undefined;
    if (existingContext && urlParams.timeRange) {
      // update the existing context with url params
      existingContext.updateTimeRangeSettings(
        this.transformTimePickerSelectionIntoDashboardSettings(urlParams.timeRange!, urlParams),
      );
    }
    const context$: Observable<TimeSeriesContext> = existingContext
      ? of(existingContext)
      : this.createContext(this.dashboard, urlParams, existingContext);
    context$.subscribe((context) => {
      this.initStateFromContext(context, urlParams?.editMode);
    });
  }

  private initStateFromContext(context: TimeSeriesContext, editMode?: boolean) {
    this.resolution = context.getChartsResolution();
    this.refreshInterval = context.getRefreshInterval();
    const state: DashboardState = {
      context: context,
      getFilterBar: () => this.filterBar!,
      getDashlets: () => this.dashlets,
      refreshInProgress: false,
    };
    this.mainEngine = new DashboardStateEngine(state);
    this.mainEngine.subscribeForContextChange();

    this.updateUrl(true);
    context.stateChange$.subscribe((stateChanged) => {
      this.updateUrl();
    });
    // notify the outside regarding the time picker selection
    context.onTimePickerOptionChange().subscribe((selection) => this.timeRangeChange.next(selection));
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
    this.mainEngine.state.context.updateRefreshInterval(interval);
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

  private updateUrl(replaceUrl = false): void {
    this._urlParamsService.updateUrlParamsFromContext(this.mainEngine.state.context, replaceUrl);
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
    this.dashboard.timeRange = this.mainEngine.state.context.getTimeRangeSettings().pickerSelection;
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

  /**
   * If there is a cached context, which has a RELATIVE time settings, the fullRange has to be updated to the current time.
   * @param settings
   * @private
   */
  private updateRelativeRangeIfNeeded(settings: DashboardTimeRangeSettings): DashboardTimeRangeSettings {
    const wasFullSelection = TimeSeriesUtils.timeRangesEqual(settings.fullRange, settings.selectedRange);
    if (settings.pickerSelection.type === 'RELATIVE') {
      const now = new Date().getTime();
      let to = now - 5000;
      let from = to - settings.pickerSelection.relativeSelection!.timeInMs;
      if (to < from) {
        to = now;
      }
      const newFullRange = { from: from, to: to };
      let newSelection: TimeRange = newFullRange;
      if (!wasFullSelection) {
        newSelection = TimeSeriesUtils.cropInterval(settings.selectedRange, newFullRange) || newFullRange;
      }
      return { ...settings, fullRange: newFullRange, selectedRange: newSelection };
    } else {
      return settings;
    }
  }

  private computeTimeRangeSettings(
    existingSettings: DashboardTimeRangeSettings | undefined,
    dashboard: DashboardView,
    urlParams: DashboardUrlParams,
  ): DashboardTimeRangeSettings {
    // priority of time ranges property: 1. URL, 2. existingCustomSelection 3. Default full selection 4. Dashboard

    const now = new Date().getTime() - 5000;

    if (urlParams.timeRange) {
      return this.transformTimePickerSelectionIntoDashboardSettings(urlParams.timeRange!, urlParams);
    }
    if (existingSettings) {
      return this.updateRelativeRangeIfNeeded(existingSettings);
    }
    if (dashboard.timeRange) {
      return this.transformTimePickerSelectionIntoDashboardSettings(dashboard.timeRange!, urlParams);
    }
    if (this.defaultFullTimeRange?.from) {
      // no custom selection in the URL
      const fullRange = {
        from: this.defaultFullTimeRange!.from,
        to: this.defaultFullTimeRange!.to || Math.max(this.defaultFullTimeRange!.from + 1, now),
      };
      return {
        pickerSelection: { type: 'FULL', absoluteSelection: fullRange },
        fullRange: fullRange,
        defaultFullRange: this.defaultFullTimeRange,
        selectedRange: urlParams.selectedTimeRange || fullRange,
      };
    } else {
      throw new Error('Not enough properties to set the default time range');
    }
  }

  private transformTimePickerSelectionIntoDashboardSettings(
    timeRangeSelection: TimeRangePickerSelection,
    urlParams: DashboardUrlParams,
  ): DashboardTimeRangeSettings {
    const end = this.defaultFullTimeRange?.to || new Date().getTime() - 5000;
    if (timeRangeSelection.type === 'RELATIVE') {
      const timeInMs = timeRangeSelection.relativeSelection!.timeInMs;
      let foundRelativeOption: TimeRangeRelativeSelection = this.timeRangeOptions.find((o) => {
        return timeInMs === o.relativeSelection?.timeInMs;
      })?.relativeSelection || {
        label: timeRangeSelection.relativeSelection!.label || `Last ${timeInMs / 60000} minutes`,
        timeInMs: timeInMs,
      };
      const fullRange = { from: end - foundRelativeOption.timeInMs, to: end };
      return {
        pickerSelection: { type: 'RELATIVE', relativeSelection: foundRelativeOption },
        fullRange: fullRange,
        selectedRange: urlParams.selectedTimeRange
          ? TimeSeriesUtils.cropInterval(urlParams.selectedTimeRange, fullRange) || fullRange
          : fullRange,
        defaultFullRange: this.defaultFullTimeRange,
      };
    } else if (timeRangeSelection.type === 'ABSOLUTE') {
      // absolute
      return {
        pickerSelection: timeRangeSelection,
        fullRange: timeRangeSelection.absoluteSelection!,
        selectedRange: urlParams.selectedTimeRange || timeRangeSelection.absoluteSelection!,
        defaultFullRange: this.defaultFullTimeRange,
      };
    } else {
      // FULL
      if (!this.defaultFullTimeRange) {
        throw new Error('Default time range must be specified when using a FULL range');
      }
      const range = {
        from: this.defaultFullTimeRange!.from!,
        to: this.defaultFullTimeRange?.to || Math.max(this.defaultFullTimeRange!.from! + 1, end),
      };
      return {
        pickerSelection: { type: 'FULL', absoluteSelection: range },
        fullRange: range,
        selectedRange: urlParams.selectedTimeRange || range,
        defaultFullRange: this.defaultFullTimeRange,
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
      dashboard,
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
    clonedSettings.filterItems.forEach((item) => (item.isHidden = false));
    clonedSettings.hiddenFilters = [];
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

  resetDashboard() {
    this._timeSeriesContextFactory.destroyContext(this.storageId);
    this.dashboard = undefined as any;
    this.dashboardBackup = undefined as any;
    this.compareModeEnabled = false;
    this.resolution = undefined;
    this.mainEngine = undefined as any;
    this.compareEngine = undefined;

    this._changeDetectorRef.detectChanges();

    this._dashboardService.getDashboardById(this.dashboardId).subscribe((dashboard) => {
      this.initState({ filters: [] }, dashboard);
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
