import { Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
  AxesSettings,
  BucketResponse,
  DashboardItem,
  FetchBucketsRequest,
  MarkerType,
  MetricAggregation,
  MetricAttribute,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import {
  COMMON_IMPORTS,
  TimeSeriesConfig,
  TimeSeriesContext,
  TimeSeriesEntityService,
  TimeSeriesUtils,
  UPlotUtilsService,
} from '../../modules/_common';
import { ChartSkeletonComponent, TimeSeriesChartComponent, TSChartSeries, TSChartSettings } from '../../modules/chart';
import { defaultIfEmpty, forkJoin, Observable, of, Subscription, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChartDashletSettingsComponent } from '../chart-dashlet-settings/chart-dashlet-settings.component';
import { Axis } from 'uplot';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';
import { TimeSeriesSyncGroup } from '../../modules/_common/types/time-series/time-series-sync-group';
import { SeriesStroke } from '../../modules/_common/types/time-series/series-stroke';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  AggregateParams,
  TimeseriesAggregatePickerComponent,
} from '../../modules/_common/components/aggregate-picker/timeseries-aggregate-picker.component';
import { MatTooltip } from '@angular/material/tooltip';

declare const uPlot: any;

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
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    ChartSkeletonComponent,
    TimeSeriesChartComponent,
    TimeseriesAggregatePickerComponent,
    MatTooltip,
  ],
})
export class ChartDashletComponent extends ChartDashlet implements OnInit {
  private readonly stepped = uPlot.paths.stepped; // this is a function from uplot wich allows to draw 'stepped' or 'stairs like' lines
  private readonly barsFunction = uPlot.paths.bars; // this is a function from uplot which allows to draw bars instead of straight lines

  readonly RATE_UNITS: RateUnit[] = [
    { menuLabel: 'Per second', unitKey: 's' },
    { menuLabel: 'Per minute', unitKey: 'm' },
    { menuLabel: 'Per hour', unitKey: 'h' },
  ];

  readonly RATE_UNITS_DIVIDERS: Record<string, number> = {
    s: 3600,
    m: 60,
    h: 1,
  };

  private _matDialog = inject(MatDialog);
  private _uPlotUtils = inject(UPlotUtilsService);

  @ViewChild('settingsMenuTrigger') settingsMenuTrigger?: MatMenuTrigger;
  @ViewChild('chart') chart!: TimeSeriesChartComponent;
  _internalSettings?: TSChartSettings;
  _attributesByIds: Record<string, MetricAttribute> = {};

  @Input() item!: DashboardItem;
  @Input() context!: TimeSeriesContext;
  @Input() height!: number;
  @Input() editMode = false;
  @Input() showExecutionLinks = false;

  @Output() remove = new EventEmitter();
  @Output() shiftLeft = new EventEmitter();
  @Output() shiftRight = new EventEmitter();

  groupingSelection: MetricAttributeSelection[] = [];
  selectedAggregate!: ChartAggregation;
  selectedAggregatePcl?: number;
  requestOql: string = '';

  private _timeSeriesService = inject(TimeSeriesService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);

  syncGroupSubscription?: Subscription;
  cachedResponse?: TimeSeriesAPIResponse;
  showHigherResolutionWarning = false;
  showMissingTTLWarning = false;
  collectionResolutionUsed: number = 0;

  ngOnInit(): void {
    if (!this.item || !this.context || !this.height) {
      throw new Error('Missing input values');
    }
    this.prepareState(this.item);
    this.fetchDataAndCreateChart().subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cItem = changes['item'];
    if (cItem?.previousValue !== cItem?.currentValue && !cItem?.firstChange) {
      this.prepareState(cItem.currentValue);
      this.refresh(true).subscribe();
    }
  }

  private subscribeToMasterDashletChanges() {
    this.syncGroupSubscription?.unsubscribe();
    this.syncGroupSubscription = new Subscription();
    if (this.item.masterChartId) {
      let syncGroup = this.context.getSyncGroup(this.item.masterChartId);
      this.syncGroupSubscription.add(
        syncGroup.onSeriesShow().subscribe((s) => {
          this.chart.showSeries(s);
        }),
      );
      this.syncGroupSubscription.add(
        syncGroup.onSeriesHide().subscribe((s) => {
          this.chart.hideSeries(s);
        }),
      );
      this.syncGroupSubscription.add(
        syncGroup.onAllSeriesShow().subscribe(() => {
          this.chart.showAllSeries();
        }),
      );
      this.syncGroupSubscription.add(
        syncGroup.onAllSeriesHide().subscribe(() => {
          this.chart.hideAllSeries();
        }),
      );
    }
  }

  private prepareState(item: DashboardItem) {
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
      this.chart?.setBlur(true);
    }
    return this.fetchDataAndCreateChart();
  }

  handleZoomReset() {
    this.context.setChartsLockedState(false);
    this.context.resetZoom();
  }

  switchAggregate(aggregate: ChartAggregation, params?: AggregateParams) {
    this.selectedAggregate = aggregate;
    this.item.chartSettings!.primaryAxes.aggregation = { type: aggregate, params: params };
    this.refresh(true).subscribe();
  }

  switchRateUnit(unit: RateUnit) {
    const primaryAggregation: MetricAggregation = this.item.chartSettings!.primaryAxes.aggregation;
    const secondaryAggregation: MetricAggregation | undefined = this.item.chartSettings!.secondaryAxes?.aggregation;
    if (primaryAggregation.type === ChartAggregation.RATE) {
      primaryAggregation.params!['rateUnit'] = unit.unitKey;
    }
    if (secondaryAggregation?.type === ChartAggregation.RATE) {
      secondaryAggregation!.params!['rateUnit'] = unit.unitKey;
    }

    if (this.cachedResponse) {
      this.createChart(this.cachedResponse);
    } else {
      this.fetchDataAndCreateChart();
    }
  }

  toggleGroupingAttribute(attribute: MetricAttributeSelection) {
    attribute.selected = !attribute.selected;
    this.refresh(true).subscribe();
  }

  handleLockStateChange(locked: boolean) {
    this.context.setChartsLockedState(locked);
  }

  openChartSettings(): void {
    this._matDialog
      .open(ChartDashletSettingsComponent, { data: { item: this.item, context: this.context } })
      .afterClosed()
      .subscribe((updatedItem) => {
        this.handleChartUpdate(updatedItem);
      });
  }

  private handleChartUpdate(updatedItem: DashboardItem) {
    if (updatedItem) {
      Object.assign(this.item, updatedItem);
      this.prepareState(this.item);
      this.refresh(true).subscribe();
    }
  }

  private getSeriesStroke(id: string, axes: AxesSettings): SeriesStroke {
    const hasGrouping = this.getGroupDimensions()?.length > 0;
    if (!hasGrouping) {
      return { color: TimeSeriesConfig.SERIES_DEFAULT_COLOR, type: MarkerType.SQUARE };
    }
    const customSeriesColor = axes.renderingSettings?.seriesColors?.[id];
    if (customSeriesColor) {
      return { color: customSeriesColor, type: MarkerType.SQUARE };
    }
    return this.context.colorsPool.getSeriesColor(id);
  }

  /**
   * When there is no grouping, the key and label will be 'Value'.
   * If there are grouping, all empty elements will be replaced with an empty label
   */
  private createChart(response: TimeSeriesAPIResponse): void {
    let syncGroup: TimeSeriesSyncGroup | undefined;
    if (this.item.masterChartId) {
      syncGroup = this.context.getSyncGroup(this.item.masterChartId);
    }
    const hasSteppedDisplay = this.item.metricKey === 'threadgroup';
    const removeChartGaps = this.item.metricKey === 'threadgroup';
    const hasSecondaryAxes = !!this.item.chartSettings!.secondaryAxes;
    const hasExecutionLinks = !!this._attributesByIds[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE] && !hasSteppedDisplay;
    const secondaryAxesAggregation = this.item.chartSettings!.secondaryAxes?.aggregation;
    const groupDimensions = this.getGroupDimensions();
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const primaryAxes = this.item.chartSettings!.primaryAxes!;
    const primaryAggregation = primaryAxes.aggregation;
    const secondaryAxesData: (number | undefined | null)[] = [];
    const series: TSChartSeries[] = response.matrix.map((seriesBuckets: BucketResponse[], i: number) => {
      const metadata: any[] = []; // here we can store meta info, like execution links or other attributes
      let labelItems = groupDimensions.map((field) => response.matrixKeys[i]?.[field]);
      if (groupDimensions.length === 0) {
        labelItems = [this.context.getMetric(this.item.metricKey).displayName];
      }
      const seriesKey = this.mergeLabelItems(labelItems);
      const stroke: SeriesStroke = this.getSeriesStroke(seriesKey, primaryAxes);

      if (hasExecutionLinks || hasSecondaryAxes) {
        response.matrix[i].forEach((b: BucketResponse, j: number) => {
          metadata.push(b?.attributes);
          if (hasSecondaryAxes) {
            const bucketValue = this.getBucketValue(b, secondaryAxesAggregation!);
            if (secondaryAxesData[j] == undefined) {
              secondaryAxesData[j] = bucketValue;
            } else if (bucketValue) {
              secondaryAxesData[j]! += bucketValue;
            }
          }
        });
      }
      const seriesData: (number | undefined | null)[] = [];
      seriesBuckets.forEach((b, i) => {
        let value = this.getBucketValue(b, primaryAggregation!);
        if (value === undefined && !removeChartGaps) {
          value = 0;
        }
        seriesData[i] = value;
      });
      const s: TSChartSeries = {
        id: seriesKey,
        scale: 'y',
        labelItems: labelItems,
        legendName: seriesKey,
        data: seriesData,
        metadata: metadata,
        value: (self, x) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(x),
        strokeConfig: stroke,
        points: { show: false },
        show: syncGroup ? syncGroup?.seriesShouldBeVisible(seriesKey) : true,
      };
      switch (stroke.type) {
        case MarkerType.SQUARE:
          s.width = 1;
          break;
        case MarkerType.DASHED:
          s.dash = [10, 5];
          s.width = 1;
          break;
        case MarkerType.DOTS:
          s.width = 2;
          s.dash = [2, 2];
          break;
      }
      if (primaryAxes.colorizationType === 'FILL') {
        s.fill = (self, seriesIdx: number) => this._uPlotUtils.gradientFill(self, stroke.color);
      }
      if (hasSteppedDisplay) {
        s.paths = this.stepped({ align: 1 });
      }
      return s;
    });
    const primaryUnit = primaryAxes.unit!;
    const yAxesUnit = this.getUnitLabel(primaryAggregation, primaryUnit);

    const axes: Axis[] = [
      {
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        scale: 'y',
        values: (u, vals) => {
          return vals.map((v: any) => this.getAxesFormatFunction(primaryAggregation, primaryUnit)(v));
        },
      },
    ];

    if (hasSecondaryAxes) {
      axes.push({
        // @ts-ignore
        scale: TimeSeriesConfig.SECONDARY_AXES_KEY,
        side: 1,
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        values: (u: unknown, vals: number[]) =>
          vals.map((v) =>
            this.getAxesFormatFunction(this.item.chartSettings!.secondaryAxes!.aggregation, undefined)(v),
          ),
        grid: { show: false },
      });
      series.unshift({
        scale: 'z',
        labelItems: ['Total'],
        id: 'total',
        strokeConfig: { color: '', type: MarkerType.SQUARE },
        data: secondaryAxesData,
        value: (x, v: number) => Math.trunc(v) + ' total',
        fill: TimeSeriesConfig.TOTAL_BARS_COLOR,
        paths: this.barsFunction({ size: [1, 100, 4], radius: 0.2, gap: 1 }),
        points: { show: false },
      });
    }

    this.fetchLegendEntities(series).subscribe((v) => {
      this._internalSettings = {
        title: this.getChartTitle(),
        xValues: xLabels,
        series: series,
        tooltipOptions: {
          enabled: true,
          zAxisLabel: this.getSecondAxesLabel(),
          yAxisUnit: yAxesUnit,
          useExecutionLinks: this.showExecutionLinks,
        },
        showLegend: groupDimensions.length > 0, // in case it has grouping, display the legend
        axes: axes,
        truncated: response.truncated,
      };
    });
  }

  private removeDataGaps(data: (number | undefined)[]): number[] {
    for (let i = 0; i < data.length; i++) {}
    return [];
  }

  private mergeLabelItems(items: (string | undefined)[]): string {
    if (items.length === 0) {
      return this.item.metricKey;
    }
    return items.map((i) => i ?? TimeSeriesConfig.SERIES_LABEL_EMPTY).join(' | ');
  }

  private getSecondAxesLabel(): string | undefined {
    const aggregation = this.item.chartSettings!.secondaryAxes?.aggregation!;
    switch (aggregation?.type) {
      case ChartAggregation.RATE:
        return 'Total Hits/' + aggregation.params?.['rateUnit'];
      case ChartAggregation.PERCENTILE:
        return 'Overall PCL ' + aggregation.params?.['pclValue'];
      default:
        return 'Overall ' + aggregation;
    }
  }

  private getPrimaryPclValue(): number | undefined {
    return this.item.chartSettings!.primaryAxes.aggregation.params?.[TimeSeriesConfig.PCL_VALUE_PARAM];
  }

  private getChartTitle(): string {
    let title = this.item.name;
    let aggregation: MetricAggregation = this.item.chartSettings!.primaryAxes.aggregation;
    let aggregationLabel;
    switch (aggregation.type) {
      case ChartAggregation.PERCENTILE:
        aggregationLabel = `PCL ${this.getPrimaryPclValue()}`;
        break;
      case ChartAggregation.RATE:
        aggregationLabel =
          'RATE/' + this.item.chartSettings!.primaryAxes.aggregation.params?.[TimeSeriesConfig.RATE_UNIT_PARAM];
        break;
      default:
        aggregationLabel = aggregation.type;
        break;
    }
    return `${title} (${aggregationLabel})`;
  }

  private fetchDataAndCreateChart(): Observable<TimeSeriesAPIResponse> {
    const groupDimensions = this.getGroupDimensions();
    const oqlFilter = this.composeRequestFilter();
    this.requestOql = oqlFilter;
    const request: FetchBucketsRequest = {
      start: this.context.getSelectedTimeRange().from,
      end: this.context.getSelectedTimeRange().to,
      groupDimensions: groupDimensions,
      oqlFilter: oqlFilter,
      percentiles: this.getRequiredPercentiles(),
    };
    const customResolution = this.context.getChartsResolution();
    if (customResolution) {
      request.intervalSize = customResolution;
    } else {
      request.numberOfBuckets = 100;
    }
    if (!!this._attributesByIds[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE]) {
      // has execution attribute
      request.collectAttributeKeys = [TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE];
      request.collectAttributesValuesLimit = 10;
    }
    return this._timeSeriesService.getTimeSeries(request).pipe(
      tap((response) => {
        this.showHigherResolutionWarning = response.higherResolutionUsed;
        this.showMissingTTLWarning = !response.ttlCovered;
        this.collectionResolutionUsed = response.collectionResolution;
        this.cachedResponse = response;
        this.createChart(response);
      }),
    );
  }

  handleAggregateChange(change: { aggregate?: ChartAggregation; params?: AggregateParams }) {
    this.switchAggregate(change.aggregate!, change.params);
    this.settingsMenuTrigger?.closeMenu();
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
                let newLabel;
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
        return this.context.getGroupDimensions();
      } else {
        return masterChart.grouping;
      }
    } else {
      if (this.item.inheritGlobalGrouping) {
        return this.context.getGroupDimensions();
      } else {
        return this.groupingSelection.filter((s) => s.selected).map((a) => a.name!);
      }
    }
  }

  private getAxesFormatFunction(aggregation: MetricAggregation, unit?: string): (v: number) => string {
    if (aggregation.type === ChartAggregation.RATE) {
      const rateUnit = aggregation.params?.[TimeSeriesConfig.RATE_UNIT_PARAM];
      return (v) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v) + '/' + rateUnit;
    }
    if (!unit) {
      return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber;
    }
    switch (unit) {
      case '1':
        return (v) => v.toString() + this.getUnitLabel(aggregation, unit);
      case 'ms':
        return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.time;
      case '%':
        return (v) => v.toString() + this.getUnitLabel(aggregation, unit);
      default:
        throw new Error('Unit not handled: ' + unit);
    }
  }

  private getUnitLabel(aggregation: MetricAggregation, unit: string): string {
    if (aggregation.type === 'RATE') {
      return '/ ' + aggregation.params?.['rateUnit'];
    }
    switch (unit) {
      case '%':
        return '%';
      case 'ms':
        return ' ms';
      default:
        return '';
    }
  }

  private getRequiredPercentiles(): number[] {
    const aggregate: ChartAggregation = this.selectedAggregate;
    const secondaryAggregate = this.item.chartSettings!.secondaryAxes?.aggregation.type;
    const percentilesToRequest: number[] = [];
    if (aggregate === ChartAggregation.MEDIAN || secondaryAggregate === ChartAggregation.MEDIAN) {
      percentilesToRequest.push(50);
    }
    if (aggregate === ChartAggregation.PERCENTILE) {
      percentilesToRequest.push(this.getPrimaryPclValue() || 90);
    }
    if (secondaryAggregate === ChartAggregation.PERCENTILE) {
      percentilesToRequest.push(
        this.item.chartSettings!.secondaryAxes?.aggregation.params?.[TimeSeriesConfig.PCL_VALUE_PARAM] || 90,
      );
    }
    return percentilesToRequest;
  }

  private getBucketValue(b: BucketResponse, aggregation: MetricAggregation): number | undefined | null {
    if (!b) {
      return undefined;
    }
    switch (aggregation.type) {
      case 'SUM':
        return b.sum;
      case 'AVG':
        return b.sum / b.count;
      case 'MAX':
        return b.max;
      case 'MIN':
        return b.min;
      case 'COUNT':
        return b.count;
      case 'RATE':
        return b.throughputPerHour / this.RATE_UNITS_DIVIDERS[aggregation.params?.['rateUnit']];
      case 'MEDIAN':
        return b.pclValues?.['50.0'];
      case 'PERCENTILE':
        return b.pclValues?.[this.getPclWithDecimals(aggregation.params?.['pclValue']) || '90.0'];
      default:
        throw new Error('Unhandled aggregation value: ' + aggregation);
    }
  }

  private getPclWithDecimals(value: number) {
    if (Math.floor(value) === value) {
      return value.toFixed(1);
    } else {
      return value;
    }
  }

  getType(): 'TABLE' | 'CHART' {
    return 'CHART';
  }

  getContext(): TimeSeriesContext {
    return this.context;
  }

  getItem(): DashboardItem {
    return this.item;
  }

  protected readonly ChartAggregation = ChartAggregation;
  protected readonly resolutionLabels = resolutionLabels;
}
