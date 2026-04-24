import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  Input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  untracked,
  viewChild,
} from '@angular/core';
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
import { defaultIfEmpty, finalize, forkJoin, map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChartDashletSettingsComponent } from '../chart-dashlet-settings/chart-dashlet-settings.component';
import { Axis, Band, Hooks } from 'uplot';
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
import { TooltipContentDirective } from '../../modules/chart/components/time-series-chart/tooltip-content.directive';
import { ChartStandardTooltipComponent } from '../../modules/chart/components/tooltip/chart-standard-tooltip.component';

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
  imports: [
    COMMON_IMPORTS,
    ChartSkeletonComponent,
    TimeSeriesChartComponent,
    TimeseriesAggregatePickerComponent,
    MatTooltip,
    TooltipContentDirective,
    ChartStandardTooltipComponent,
  ],
  standalone: true,
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
  protected _cd = inject(ChangeDetectorRef);

  readonly settingsMenuTrigger = viewChild<MatMenuTrigger>('settingsMenuTrigger');
  readonly chart = viewChild<TimeSeriesChartComponent>('chart');

  readonly _internalSettings = signal<TSChartSettings | undefined>(undefined);
  _attributesByIds: Record<string, MetricAttribute> = {};

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

  readonly isLoading = signal<boolean>(false);

  groupingSelection: MetricAttributeSelection[] = [];
  selectedAggregate!: ChartAggregation;
  selectedAggregatePcl?: number;
  requestOql: string = '';

  private _timeSeriesService = inject(TimeSeriesService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);

  syncGroupSubscription?: Subscription;
  cachedRequest?: FetchBucketsRequest;
  cachedResponse?: TimeSeriesAPIResponse;
  showHigherResolutionWarning = false;
  collectionResolutionUsed: number = 0;

  firstEffectTriggered = false;

  readonly itemChangeEffect = effect(() => {
    const item = this.item();
    if (this.firstEffectTriggered) {
      untracked(() => {
        this.prepareState(item);
        this.refresh(true).subscribe(() => {
          this._cd.markForCheck();
        });
      });
    }
    this.firstEffectTriggered = true;
  });

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

  handleZoomReset(): void {
    this.context().setChartsLockedState(false);
    this.zoomReset.emit();
  }

  switchAggregate(aggregate: ChartAggregation, params?: AggregateParams): void {
    this.selectedAggregate = aggregate;
    this.item().chartSettings!.primaryAxes.aggregation = { type: aggregate, params: params };
    this.refresh(true).subscribe(() => {
      this._cd.markForCheck();
    });
  }

  switchRateUnit(unit: RateUnit): void {
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

  toggleGroupingAttribute(attribute: MetricAttributeSelection): void {
    attribute.selected = !attribute.selected;
    this.refresh(true).subscribe(() => {
      this._cd.markForCheck();
    });
  }

  handleLockStateChange(locked: boolean): void {
    this.context().setChartsLockedState(locked);
  }

  openChartSettings(): void {
    this._matDialog
      .open(ChartDashletSettingsComponent, { data: { item: this.item(), context: this.context() } })
      .afterClosed()
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

  private getSeriesStroke(id: string, axes: AxesSettings): SeriesStroke {
    const hasGrouping = this.getGroupDimensions()?.length > 0;
    if (!hasGrouping) {
      return { color: TimeSeriesConfig.SERIES_DEFAULT_COLOR, type: MarkerType.SQUARE };
    }
    const customSeriesColor = axes.renderingSettings?.seriesColors?.[id];
    if (customSeriesColor) {
      return { color: customSeriesColor, type: MarkerType.SQUARE };
    }
    return this.context().colorsPool.getSeriesColor(id);
  }

  /**
   * When there is no grouping, the key and label will be 'Value'.
   * If there are grouping, all empty elements will be replaced with an empty label
   */
  private createChartSettings(
    response: TimeSeriesAPIResponse,
    request: FetchBucketsRequest,
  ): Observable<TSChartSettings> {
    let syncGroup: TimeSeriesSyncGroup | undefined;
    if (this.item().masterChartId) {
      syncGroup = this.context().getSyncGroup(this.item().masterChartId!);
    }
    const primaryAxes = this.item().chartSettings!.primaryAxes!;
    const primaryAggregation = primaryAxes.aggregation;
    const hasSteppedDisplay = primaryAxes.displayType === 'STEPPED';
    const hasSecondaryAxes = !!this.item().chartSettings!.secondaryAxes;
    const hasExecutionLinks = !!this._attributesByIds[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE] && !hasSteppedDisplay;
    const secondaryAxesAggregation = this.item().chartSettings!.secondaryAxes?.aggregation;
    const groupDimensions = this.getGroupDimensions();
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const barPaths = this.barsFunction({ size: [0.98, Infinity], align: 1, radius: 0.1 });
    const stackedBarPaths = this.barsFunction({ size: [0.85, Infinity], align: 1, radius: 0.1 });
    const isGauge = this.context().getMetric(this.item().metricKey)?.instrumentType === 'gauge';
    const isRateOrCount = primaryAggregation.type === 'RATE' || primaryAggregation.type === 'COUNT';
    const useForwardFill = isGauge && !isRateOrCount;
    const isNullMeansZero =
      isRateOrCount ||
      (!isGauge && (primaryAxes.displayType === 'BAR_CHART' || primaryAxes.displayType === 'STACKED_BAR'));
    const spanGaps = !isNullMeansZero && !useForwardFill;
    const isSecondaryRateOrCount =
      secondaryAxesAggregation?.type === 'RATE' || secondaryAxesAggregation?.type === 'COUNT';
    const useSecondaryForwardFill = isGauge && !isSecondaryRateOrCount;
    const secondaryAxesData: (number | undefined | null)[] = [];
    const series: TSChartSeries[] = response.matrix.map((seriesBuckets: BucketResponse[], i: number) => {
      const metadata: any[] = []; // here we can store meta info, like execution links or other attributes
      let labelItems = groupDimensions.map((field) => response.matrixKeys[i]?.[field] || undefined); // convert empty strings to undefined
      if (groupDimensions.length === 0) {
        labelItems = [this.context().getMetric(this.item().metricKey).displayName];
      }
      const seriesKey = this.mergeLabelItems(labelItems);
      const stroke: SeriesStroke = this.getSeriesStroke(seriesKey, primaryAxes);

      if (hasExecutionLinks || hasSecondaryAxes) {
        let lastSecondaryValue: number | undefined;
        response.matrix[i].forEach((b: BucketResponse, j: number) => {
          metadata.push(b?.attributes);
          if (hasSecondaryAxes) {
            let bucketValue = this.getBucketValue(b, secondaryAxesAggregation!, response.interval);
            if (bucketValue == null && useSecondaryForwardFill) {
              bucketValue = lastSecondaryValue;
            }
            if (bucketValue != null) {
              lastSecondaryValue = bucketValue;
            }
            if (secondaryAxesData[j] == null) {
              secondaryAxesData[j] = bucketValue;
            } else if (bucketValue != null) {
              secondaryAxesData[j] = (secondaryAxesData[j] as number) + bucketValue;
            }
          }
        });
      }
      const seriesData: (number | undefined | null)[] = [];
      let lastPrimaryValue: number | undefined;
      seriesBuckets.forEach((b, i) => {
        let value = this.getBucketValue(b, primaryAggregation!, response.interval);
        if (value === undefined) {
          if (isNullMeansZero) {
            value = 0;
          } else if (useForwardFill) {
            value = lastPrimaryValue;
          }
        }
        if (value != null) {
          lastPrimaryValue = value;
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
        spanGaps: spanGaps,
        value: (self, x) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(x),
        strokeConfig: stroke,
        points:
          spanGaps && primaryAxes.displayType === 'LINE'
            ? { show: true, size: 5, fill: stroke.color, width: 0 }
            : { show: false },
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
      if (primaryAxes.colorizationType === 'FILL' && primaryAxes.displayType !== 'STACKED_BAR') {
        s.fill = (self, seriesIdx: number) => this._uPlotUtils.gradientFill(self, stroke.color);
      }
      switch (primaryAxes.displayType) {
        case 'BAR_CHART':
          s.paths = barPaths;
          break;
        case 'STEPPED':
          s.paths = this.stepped({ align: 1 });
          break;
      }
      return s;
    });

    const edgeExtensionHook: Hooks.Arrays | undefined =
      spanGaps && primaryAxes.displayType === 'LINE'
        ? {
            drawSeries: [
              (u: any, seriesIdx: number) => {
                if (!u.series[seriesIdx].show) return;
                const ourSeries = series[seriesIdx - 1];
                if (!ourSeries || ourSeries.scale !== 'y' || !ourSeries.spanGaps) return;
                const yData = u.data[seriesIdx] as (number | null | undefined)[];
                let firstIdx = -1;
                let lastIdx = -1;
                for (let k = 0; k < yData.length; k++) {
                  if (yData[k] != null) {
                    if (firstIdx === -1) firstIdx = k;
                    lastIdx = k;
                  }
                }
                if (firstIdx === -1 || (firstIdx === 0 && lastIdx === yData.length - 1)) return;
                const xData = u.data[0] as number[];
                const ctx = u.ctx as CanvasRenderingContext2D;
                const dpr: number = devicePixelRatio || 1;
                ctx.save();
                ctx.strokeStyle = ourSeries.strokeConfig!.color + '70';
                ctx.lineWidth = dpr;
                ctx.setLineDash([4 * dpr, 4 * dpr]);
                if (firstIdx > 0) {
                  const yPos = u.valToPos(yData[firstIdx], 'y', true);
                  const xPos = u.valToPos(xData[firstIdx], 'x', true);
                  ctx.beginPath();
                  ctx.moveTo(u.bbox.left, yPos);
                  ctx.lineTo(xPos, yPos);
                  ctx.stroke();
                }
                if (lastIdx < yData.length - 1) {
                  const yPos = u.valToPos(yData[lastIdx], 'y', true);
                  const xPos = u.valToPos(xData[lastIdx], 'x', true);
                  ctx.beginPath();
                  ctx.moveTo(xPos, yPos);
                  ctx.lineTo(u.bbox.left + u.bbox.width, yPos);
                  ctx.stroke();
                }
                ctx.restore();
              },
            ],
          }
        : undefined;

    let bands: Band[] | undefined;
    if (primaryAxes.displayType === 'STACKED_BAR') {
      series.sort((a, b) => (a.id! < b.id! ? -1 : a.id! > b.id! ? 1 : 0));
      series.forEach((s) => (s.originalData = [...s.data]));
      this.cumulateSeriesData(series);
      const skipSeries = hasSecondaryAxes ? 1 : 0;
      series.forEach((s) => {
        s.paths = stackedBarPaths;
        s.fill = s.strokeConfig!.color + 'cc';
        s.value = (self: any, x: number, seriesIdx: number, idx: number) =>
          TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(
            this.calculateStackedValue(self, x, seriesIdx, idx, skipSeries),
          );
      });
      bands = this.getStackedBands(series.length, skipSeries);
    }
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
            this.getAxesFormatFunction(this.item().chartSettings!.secondaryAxes!.aggregation, undefined)(v),
          ),
        grid: { show: false },
      });
      const secondaryAxesSettings = this.item().chartSettings!.secondaryAxes!;
      const secondaryDisplayType = secondaryAxesSettings.displayType;
      const secondaryNullMeansZero = isSecondaryRateOrCount || (!isGauge && secondaryDisplayType !== 'LINE');
      if (useSecondaryForwardFill) {
        let lastSecVal: number | undefined;
        for (let k = 0; k < secondaryAxesData.length; k++) {
          if (secondaryAxesData[k] == null) {
            secondaryAxesData[k] = lastSecVal;
          } else {
            lastSecVal = secondaryAxesData[k] as number;
          }
        }
      } else if (secondaryNullMeansZero) {
        for (let k = 0; k < secondaryAxesData.length; k++) {
          if (secondaryAxesData[k] == null) {
            secondaryAxesData[k] = 0;
          }
        }
      }
      const secondarySeries: TSChartSeries = {
        scale: 'z',
        labelItems: ['Total'],
        id: 'total',
        strokeConfig: { color: '', type: MarkerType.SQUARE },
        data: secondaryAxesData,
        spanGaps: !secondaryNullMeansZero && !useSecondaryForwardFill,
        value: (x, v: number) => Math.trunc(v) + ' total',
        points: { show: false },
      };
      if (secondaryDisplayType !== 'LINE') {
        secondarySeries.paths = barPaths;
        secondarySeries.fill = TimeSeriesConfig.TOTAL_BARS_COLOR;
      } else {
        // scale:'z' series are skipped by the chart component's automatic stroke assignment, so set it explicitly
        secondarySeries.stroke = TimeSeriesConfig.TOTAL_BARS_COLOR;
        secondarySeries.fill = (self: any) => this._uPlotUtils.gradientFill(self, TimeSeriesConfig.TOTAL_BARS_COLOR);
      }
      series.unshift(secondarySeries);
    }

    const fetchExecutionsFn: (idx: number, seriesId: string) => Observable<string[]> = (
      idx: number,
      seriesId: string,
    ) => {
      if (!response.collectionIgnoredAttributes?.includes('eId')) {
        // if eId is not ignored, the eIds attributes should be received on the response
        return of([]);
      }
      const selectedSeriesIndex = series.findIndex((s) => s.id === seriesId);
      const selectedBucketAttributes = response.matrixKeys[selectedSeriesIndex - (hasSecondaryAxes ? 1 : 0)];
      request.groupDimensions?.forEach((dimension) => {
        if (!selectedBucketAttributes[dimension]) {
          // force null filtering for missing attributes
          selectedBucketAttributes[dimension] = null;
        }
      });
      const isolateRequest: FetchBucketsRequest = {
        start: xLabels[idx],
        end: xLabels[idx] + response.interval,
        groupDimensions: ['eId'],
        oqlFilter: request.oqlFilter,
        params: selectedBucketAttributes,
      };
      return this._timeSeriesService.fetchBuckets(isolateRequest).pipe(
        map((response) => {
          return response.matrixKeys.map((attributes) => attributes['eId']);
        }),
      );
    };

    return this.fetchLegendEntities(series).pipe(
      map((v) => {
        return {
          title: this.getChartTitle(),
          xAxesSettings: {
            values: xLabels,
          },
          series: series,
          tooltipOptions: {
            enabled: true,
            zAxisLabel: this.getSecondAxesLabel(),
            yAxisUnit: yAxesUnit,
            useExecutionLinks: this.showExecutionLinks(),
            fetchExecutionsFn: fetchExecutionsFn,
          },
          showLegend: true,
          axes: axes,
          bands: bands,
          hooks: edgeExtensionHook,
          scales:
            primaryAxes.displayType === 'STACKED_BAR'
              ? { y: { range: (_: any, _min: number, max: number) => [0, max] as [number, number] } }
              : undefined,
          cursor:
            primaryAxes.displayType === 'BAR_CHART' || primaryAxes.displayType === 'STACKED_BAR'
              ? {
                  dataIdx: (self: any, seriesIdx: number, hoveredIdx: number, cursorXVal: number) => {
                    const xData = self.data[0] as number[];
                    let i = hoveredIdx;
                    while (i > 0 && xData[i] > cursorXVal) i--;
                    while (i < xData.length - 1 && xData[i + 1] <= cursorXVal) i++;
                    return i;
                  },
                }
              : undefined,
          truncated: response.truncated,
        };
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  private removeDataGaps(data: (number | undefined)[]): number[] {
    for (let i = 0; i < data.length; i++) {}
    return [];
  }

  private mergeLabelItems(items: (string | undefined)[]): string {
    if (items.length === 0) {
      return this.item().metricKey;
    }
    return items
      .map((i) => {
        if (i === '' || i == null) {
          return TimeSeriesConfig.SERIES_LABEL_EMPTY;
        } else {
          return i;
        }
      })
      .join(' | ');
  }

  private getSecondAxesLabel(): string | undefined {
    const aggregation = this.item().chartSettings!.secondaryAxes?.aggregation!;
    switch (aggregation?.type) {
      case ChartAggregation.RATE:
        return 'Total Hits/' + aggregation.params?.['rateUnit'];
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
    let aggregation: MetricAggregation = this.item().chartSettings!.primaryAxes.aggregation;
    let aggregationLabel;
    switch (aggregation.type) {
      case ChartAggregation.PERCENTILE:
        aggregationLabel = `PCL ${this.getPrimaryPclValue()}`;
        break;
      case ChartAggregation.RATE:
        aggregationLabel = 'RATE/' + this.getRateUnit(aggregation);
        break;
      default:
        aggregationLabel = aggregation.type;
        break;
    }
    return `${title} (${aggregationLabel})`;
  }

  private getRateUnit(aggregation: MetricAggregation): string {
    return aggregation.params?.[TimeSeriesConfig.RATE_UNIT_PARAM] || 's';
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
    const request: FetchBucketsRequest = {
      start: start,
      end: end,
      metricType: this.item().metricKey,
      groupDimensions: groupDimensions,
      oqlFilter: oqlFilter,
      percentiles: this.getRequiredPercentiles(),
    };
    const customResolution = this.context().getChartsResolution();
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
    return this._timeSeriesService.fetchBucketsWithFallback(request).pipe(
      tap((response) => {
        this.showHigherResolutionWarning = response.higherResolutionUsed;
        this.collectionResolutionUsed = response.collectionResolution;
        this.cachedResponse = response;
        this.cachedRequest = request;
        this.emptyStateChange.emit(response.matrix.length === 0);
      }),
      switchMap((response) => this.createChartSettings(response, request)),
    );
  }

  handleAggregateChange(change: { aggregate?: ChartAggregation; params?: AggregateParams }): void {
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

  private getAxesFormatFunction(aggregation: MetricAggregation, unit?: string): (v: number) => string {
    if (aggregation.type === ChartAggregation.RATE) {
      const rateUnit = this.getRateUnit(aggregation);
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
      return '/ ' + this.getRateUnit(aggregation);
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
    const secondaryAggregate = this.item().chartSettings!.secondaryAxes?.aggregation.type;
    const percentilesToRequest: number[] = [];
    if (aggregate === ChartAggregation.MEDIAN || secondaryAggregate === ChartAggregation.MEDIAN) {
      percentilesToRequest.push(50);
    }
    if (aggregate === ChartAggregation.PERCENTILE) {
      percentilesToRequest.push(this.getPrimaryPclValue() || 90);
    }
    if (secondaryAggregate === ChartAggregation.PERCENTILE) {
      percentilesToRequest.push(
        this.item().chartSettings!.secondaryAxes?.aggregation.params?.[TimeSeriesConfig.PCL_VALUE_PARAM] || 90,
      );
    }
    return percentilesToRequest;
  }

  private getBucketValue(
    b: BucketResponse,
    aggregation: MetricAggregation,
    bucketIntervalMs: number,
  ): number | undefined | null {
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
        if (this.item().metricKey === 'counter') {
          return b.sum / (bucketIntervalMs / 3_600_000) / this.RATE_UNITS_DIVIDERS[this.getRateUnit(aggregation)];
        }
        return b.throughputPerHour / this.RATE_UNITS_DIVIDERS[this.getRateUnit(aggregation)];
      case 'MEDIAN':
        return b.pclValues?.['50.0'];
      case 'PERCENTILE':
        return b.pclValues?.[this.getPclWithDecimals(aggregation.params?.['pclValue']) || '90.0'];
      default:
        throw new Error('Unhandled aggregation value: ' + aggregation);
    }
  }

  private getPclWithDecimals(value: number): string | number {
    if (Math.floor(value) === value) {
      return value.toFixed(1);
    } else {
      return value;
    }
  }

  private cumulateSeriesData(series: TSChartSeries[]): void {
    series.forEach((s, i) => {
      if (i === 0) return;
      s.data.forEach((_, j) => {
        s.data[j] = (series[i - 1].data[j] as number) + (s.data[j] as number);
      });
    });
  }

  private calculateStackedValue(
    self: any,
    currentValue: number,
    seriesIdx: number,
    idx: number,
    skipSeries: number,
  ): number {
    if (seriesIdx > 1 + skipSeries) {
      return currentValue - (self.data[seriesIdx - 1][idx] || 0);
    }
    return currentValue;
  }

  private getStackedBands(count: number, skipSeries = 0): Band[] {
    const bands: Band[] = [];
    for (let i = count; i > 1; i--) {
      bands.push({ series: [i + skipSeries, i - 1 + skipSeries] });
    }
    return bands;
  }

  getType(): 'TABLE' | 'CHART' {
    return 'CHART';
  }

  getContext(): TimeSeriesContext {
    return this.context();
  }

  getItem(): DashboardItem {
    return this.item();
  }

  protected readonly ChartAggregation = ChartAggregation;
  protected readonly resolutionLabels = resolutionLabels;
}
