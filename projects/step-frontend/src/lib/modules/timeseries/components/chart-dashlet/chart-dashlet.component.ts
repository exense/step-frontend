import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  DashboardItem,
  FetchBucketsRequest,
  MetricAggregation,
  MetricAttribute,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import {
  COMMON_IMPORTS,
  PipelineAggregationService,
  TimeSeriesConfig,
  TimeSeriesChartUtilsService,
  TimeSeriesContext,
  TimeSeriesEntityService,
} from '../../modules/_common';
import { TimeSeriesChartComponent, TSChartSeries, TSChartSettings } from '../../modules/chart';
import {
  catchError,
  defaultIfEmpty,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  skip,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChartDashletSettingsComponent } from '../chart-dashlet-settings/chart-dashlet-settings.component';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  AggregateParams,
  TimeseriesAggregatePickerComponent,
} from '../../modules/_common/components/aggregate-picker/timeseries-aggregate-picker.component';
import { MatTooltip } from '@angular/material/tooltip';
import { TooltipContentDirective } from '../../modules/chart/components/time-series-chart/tooltip-content.directive';
import { ChartStandardTooltipComponent } from '../../modules/chart/components/tooltip/chart-standard-tooltip.component';

interface MetricAttributeSelection extends MetricAttribute {
  selected: boolean;
}

interface RateUnit {
  menuLabel: string;
  unitKey: string;
}

const resolutionLabels: Record<string, string> = {
  '60000': 'Minute',
  '3600000': 'Hour',
  '86400000': 'Day',
  '604800000': 'Week',
};

@Component({
  selector: 'step-chart-dashlet',
  templateUrl: './chart-dashlet.component.html',
  styleUrls: ['./chart-dashlet.component.scss'],
  imports: [
    COMMON_IMPORTS,
    TimeSeriesChartComponent,
    TimeseriesAggregatePickerComponent,
    MatTooltip,
    TooltipContentDirective,
    ChartStandardTooltipComponent,
  ],
  standalone: true,
})
export class ChartDashletComponent extends ChartDashlet implements OnInit, OnDestroy {
  protected readonly RATE_UNITS: RateUnit[] = [
    { menuLabel: 'Per second', unitKey: 's' },
    { menuLabel: 'Per minute', unitKey: 'm' },
    { menuLabel: 'Per hour', unitKey: 'h' },
  ];

  private _matDialog = inject(MatDialog);
  private _pipelineAggregationService = inject(PipelineAggregationService);
  private _timeSeriesChartUtils = inject(TimeSeriesChartUtilsService);
  protected _cd = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);

  protected readonly settingsMenuTrigger = viewChild<MatMenuTrigger>('settingsMenuTrigger');
  protected readonly chart = viewChild<TimeSeriesChartComponent>('chart');

  protected readonly _internalSettings = signal<TSChartSettings | undefined>(undefined);
  protected _attributesByIds: Record<string, MetricAttribute> = {};

  readonly item = input.required<DashboardItem>();
  readonly context = input.required<TimeSeriesContext>();
  readonly height = input.required<number>();
  readonly editMode = input<boolean>(false);
  readonly showExecutionLinks = input<boolean>(false);
  readonly showLoadingSpinnerWhileLoading = input<boolean>(true);

  readonly remove = output();
  readonly shiftLeft = output();
  readonly shiftRight = output();
  readonly zoomReset = output();
  readonly emptyStateChange = output<boolean>();

  protected readonly isLoading = signal<boolean>(false);

  protected groupingSelection: MetricAttributeSelection[] = [];
  protected selectedAggregate!: ChartAggregation;
  protected selectedAggregatePcl?: number;
  protected requestOql: string = '';

  private _timeSeriesService = inject(TimeSeriesService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);

  protected syncGroupSubscription?: Subscription;
  protected cachedRequest?: FetchBucketsRequest;
  protected cachedResponse?: TimeSeriesAPIResponse;
  protected showHigherResolutionWarning = false;
  protected collectionResolutionUsed: number = 0;

  private readonly _itemChangeSub = toObservable(this.item)
    .pipe(
      skip(1),
      switchMap((item) => {
        this.prepareState(item);
        return this.refresh(true).pipe(catchError(() => of(undefined)));
      }),
      takeUntilDestroyed(this._destroyRef),
    )
    .subscribe(() => this._cd.markForCheck());

  ngOnInit(): void {
    if (!this.item() || !this.context() || !this.height()) {
      throw new Error('Missing input values');
    }
    this.prepareState(this.item());
    this.createChart();
  }

  private createChart(): void {
    this.fetchDataAndCreateChartSettings().subscribe((settings) => {
      this._internalSettings.set(settings);
    });
  }

  private subscribeToMasterDashletChanges(): void {
    this.syncGroupSubscription?.unsubscribe();
    this.syncGroupSubscription = new Subscription();
    if (this.item().masterChartId) {
      let syncGroup = this.context().getSyncGroup(this.item().masterChartId!);
      this.syncGroupSubscription.add(
        syncGroup.onSeriesShow().subscribe((s) => {
          this.chart()!.showSeries(s);
        }),
      );
      this.syncGroupSubscription.add(
        syncGroup.onSeriesHide().subscribe((s) => {
          this.chart()!.hideSeries(s);
        }),
      );
      this.syncGroupSubscription.add(
        syncGroup.onAllSeriesShow().subscribe(() => {
          this.chart()!.showAllSeries();
        }),
      );
      this.syncGroupSubscription.add(
        syncGroup.onAllSeriesHide().subscribe(() => {
          this.chart()!.hideAllSeries();
        }),
      );
    }
  }

  private prepareState(item: DashboardItem): void {
    item.attributes?.forEach((attr) => (this._attributesByIds[attr.name] = attr));
    this.groupingSelection = this.prepareGroupingAttributes(item);
    const initialAggregate = item.chartSettings!.primaryAxes!.aggregation;
    this.selectedAggregate = initialAggregate.type as ChartAggregation;
    this.selectedAggregatePcl = initialAggregate.params?.[TimeSeriesConfig.PCL_VALUE_PARAM] || 90;
    this.subscribeToMasterDashletChanges();
  }

  private prepareGroupingAttributes(item: DashboardItem): MetricAttributeSelection[] {
    const groupingSelection: MetricAttributeSelection[] =
      item.attributes?.map((a) => ({ ...a, selected: false })) || [];
    item.grouping?.forEach((a) => {
      const foundAttribute = groupingSelection.find((attr) => attr.name === a);
      if (foundAttribute) {
        foundAttribute.selected = true;
      }
    });
    return groupingSelection;
  }

  public refresh(blur?: boolean): Observable<any> {
    if (blur) {
      this.chart()?.setBlur(true);
    }
    return this.fetchDataAndCreateChartSettings().pipe(tap((settings) => this._internalSettings.set(settings)));
  }

  protected handleZoomReset(): void {
    this.context().setChartsLockedState(false);
    this.zoomReset.emit();
  }

  protected switchAggregate(aggregate: ChartAggregation, params?: AggregateParams): void {
    this.selectedAggregate = aggregate;
    this.item().chartSettings!.primaryAxes.aggregation = { type: aggregate, params: params };
    this.refresh(true).subscribe(() => {
      this._cd.markForCheck();
    });
  }

  protected switchRateUnit(unit: RateUnit): void {
    const primaryAggregation: MetricAggregation = this.item().chartSettings!.primaryAxes.aggregation;
    const secondaryAggregation: MetricAggregation | undefined = this.item().chartSettings!.secondaryAxes?.aggregation;
    if (primaryAggregation.type === ChartAggregation.RATE) {
      primaryAggregation.params!['rateUnit'] = unit.unitKey;
    }
    if (secondaryAggregation?.type === ChartAggregation.RATE) {
      secondaryAggregation!.params!['rateUnit'] = unit.unitKey;
    }

    if (this.cachedResponse && this.cachedRequest) {
      this.createChartSettings(this.cachedResponse, this.cachedRequest).subscribe((settings) =>
        this._internalSettings.set(settings),
      );
    } else {
      this.createChart();
    }
  }

  protected toggleGroupingAttribute(attribute: MetricAttributeSelection): void {
    attribute.selected = !attribute.selected;
    this.refresh(true).subscribe(() => {
      this._cd.markForCheck();
    });
  }

  protected handleLockStateChange(locked: boolean): void {
    this.context().setChartsLockedState(locked);
  }

  protected openChartSettings(): void {
    this._matDialog
      .open(ChartDashletSettingsComponent, {
        data: { item: this.item(), context: this.context() },
        width: '96rem',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((updatedItem) => {
        this.handleChartUpdate(updatedItem);
      });
  }

  private handleChartUpdate(updatedItem: DashboardItem): void {
    if (updatedItem) {
      Object.assign(this.item(), updatedItem);
      this.prepareState(this.item());
      this.refresh(true).subscribe(() => {
        this._cd.markForCheck();
      });
    }
  }

  private createChartSettings(
    response: TimeSeriesAPIResponse,
    request: FetchBucketsRequest,
  ): Observable<TSChartSettings> {
    const item = this.item();
    const metric = this.context().getMetric(item.metricKey);
    const syncGroup = item.masterChartId ? this.context().getSyncGroup(item.masterChartId) : undefined;
    return this._timeSeriesChartUtils
      .createChartSettings({
        response,
        request,
        metricKey: item.metricKey,
        metricDisplayName: metric.displayName,
        primaryAxes: item.chartSettings!.primaryAxes,
        secondaryAxes: item.chartSettings!.secondaryAxes,
        groupDimensions: this.getGroupDimensions(),
        colorsPool: this.context().colorsPool,
        title: this.getChartTitle(),
        instrumentType: metric.instrumentType,
        samplingMode: metric.samplingMode,
        syncGroup,
        hasExecutionAttribute: !!this._attributesByIds[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE],
        showExecutionLinks: this.showExecutionLinks(),
        secondaryAxesLabel: this.getSecondAxesLabel(),
        useDefaultColorWithoutGrouping: true,
        fetchLegendEntities: (series) => this.fetchLegendEntities(series),
      })
      .pipe(finalize(() => this.isLoading.set(false)));
  }

  private getSecondAxesLabel(): string | undefined {
    if (this._pipelineAggregationService.getTwoStageAggregation(this.item().chartSettings!.primaryAxes.aggregation)) {
      return 'Total';
    }
    const aggregation = this.item().chartSettings!.secondaryAxes?.aggregation!;
    switch (aggregation?.type) {
      case ChartAggregation.RATE:
        return 'Total Hits/' + this._timeSeriesChartUtils.getRateUnit(aggregation);
      case ChartAggregation.PERCENTILE:
        return 'Total (PCL ' + aggregation.params?.['pclValue'] + ')';
      default:
        return 'Total (' + aggregation?.type + ')';
    }
  }

  private getPrimaryPclValue(): number | undefined {
    return this.item().chartSettings!.primaryAxes.aggregation.params?.[TimeSeriesConfig.PCL_VALUE_PARAM];
  }

  private getChartTitle(): string {
    let title = this.item().name;
    const aggregation: MetricAggregation = this.item().chartSettings!.primaryAxes.aggregation;
    const twoStageAggregation = this._pipelineAggregationService.getTwoStageAggregation(aggregation);
    if (twoStageAggregation) {
      return `${title} (${this._pipelineAggregationService.getPipelineLabel(twoStageAggregation)})`;
    } else {
      let aggregationLabel: string;
      switch (aggregation.type) {
        case ChartAggregation.PERCENTILE:
          aggregationLabel = `PCL ${this.getPrimaryPclValue()}`;
          break;
        case ChartAggregation.RATE:
          aggregationLabel = 'RATE/' + this._timeSeriesChartUtils.getRateUnit(aggregation);
          break;
        default:
          aggregationLabel = aggregation.type;
          break;
      }
      return `${title} (${aggregationLabel})`;
    }
  }

  private fetchDataAndCreateChartSettings(): Observable<TSChartSettings> {
    this.isLoading.set(true);
    const groupDimensions = this.getGroupDimensions();
    const oqlFilter = this.composeRequestFilter();
    this.requestOql = oqlFilter;
    const start = this.context().getSelectedTimeRange().from;
    const end = this.context().getSelectedTimeRange().to;
    if (start >= end) {
      throw new Error(`Invalid time range`);
    }
    const request = this._timeSeriesChartUtils.createRequest({
      range: { from: start, to: end },
      metricKey: this.item().metricKey,
      groupDimensions,
      oqlFilter,
      primaryAggregation: this.item().chartSettings!.primaryAxes.aggregation,
      secondaryAggregation: this.item().chartSettings!.secondaryAxes?.aggregation,
      resolution: this.context().getChartsResolution(),
      collectExecutionIds: !!this._attributesByIds[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE],
    });
    return this._timeSeriesService.fetchBucketsWithFallback(request).pipe(
      tap((response) => {
        const responseMetadata = this._timeSeriesChartUtils.getResponseMetadata(response);
        this.showHigherResolutionWarning = responseMetadata.higherResolutionUsed;
        this.collectionResolutionUsed = responseMetadata.collectionResolution;
        this.cachedResponse = response;
        this.cachedRequest = request;
        this.emptyStateChange.emit(responseMetadata.empty);
      }),
      switchMap((response) => this.createChartSettings(response, request)),
      takeUntilDestroyed(this._destroyRef),
    );
  }

  protected handleAggregateChange(change: { aggregate?: ChartAggregation; params?: AggregateParams }): void {
    this.switchAggregate(change.aggregate!, change.params);
    this.settingsMenuTrigger()?.closeMenu();
  }

  private fetchLegendEntities(series: TSChartSeries[]): Observable<any> {
    const groupDimensions = this.getGroupDimensions();
    const requests$ = groupDimensions
      .map((attributeKey, i) => {
        const attribute = this._attributesByIds[attributeKey];
        const entityName = attribute?.metadata['entity'];
        if (!entityName) {
          return undefined;
        }
        const entityIds: Set<string> = new Set<string>(
          series
            .map((s) => {
              if (s.scale !== 'y') {
                // ignore other scales
                return '';
              } else {
                return s.labelItems[i]!;
              }
            })
            .filter((v) => !!v),
        );
        if (entityIds.size === 0) {
          of(undefined);
        }
        return this._timeSeriesEntityService.getEntityNames(Array.from(entityIds.values()), entityName).pipe(
          tap((response) => {
            series.forEach((s, j) => {
              const labelId = s.labelItems[i];
              if (labelId) {
                let newLabel: string;
                if (response[labelId]) {
                  newLabel = response[labelId];
                } else {
                  newLabel = labelId + ' (unresolved)';
                }
                s.labelItems[i] = newLabel;
              }
            });
          }),
        );
      })
      .filter((x) => !!x);
    return forkJoin(requests$).pipe(defaultIfEmpty(null));
  }

  private getGroupDimensions(): string[] {
    const masterChart = this.getMasterChart();
    if (masterChart) {
      if (masterChart.inheritGlobalGrouping) {
        return this.context().getGroupDimensions();
      } else {
        return masterChart.grouping;
      }
    } else {
      if (this.item().inheritGlobalGrouping) {
        return this.context().getGroupDimensions();
      } else {
        return this.groupingSelection.filter((s) => s.selected).map((a) => a.name!);
      }
    }
  }

  ngOnDestroy(): void {
    this.syncGroupSubscription?.unsubscribe();
  }

  public getType(): 'TABLE' | 'CHART' {
    return 'CHART';
  }

  public getContext(): TimeSeriesContext {
    return this.context();
  }

  public getItem(): DashboardItem {
    return this.item();
  }

  protected readonly ChartAggregation = ChartAggregation;
  protected readonly resolutionLabels = resolutionLabels;
}
