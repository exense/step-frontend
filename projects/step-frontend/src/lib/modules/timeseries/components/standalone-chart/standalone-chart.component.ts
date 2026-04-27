import { Component, computed, EventEmitter, Output, inject, input, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  TimeseriesColorsPool,
  TimeSeriesConfig,
  TimeSeriesUtils,
  UPlotUtilsService,
} from '../../modules/_common';
import { TimeSeriesChartComponent, TSChartSeries, TSChartSettings } from '../../modules/chart';
import {
  BucketResponse,
  FetchBucketsRequest,
  TimeRange,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { Observable, switchMap, tap } from 'rxjs';
import { Axis } from 'uplot';
import { StandaloneChartConfig } from './standalone-chart-config';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';

declare const uPlot: any;

@Component({
  selector: 'step-standalone-dashlet',
  templateUrl: './standalone-chart.component.html',
  styleUrls: ['./standalone-chart.component.scss'],
  imports: [TimeSeriesChartComponent],
})
export class StandaloneChartComponent {
  private readonly barsFunction = uPlot.paths.bars;
  private readonly chart = viewChild<TimeSeriesChartComponent>('chart');

  readonly metricKey = input.required<string>();
  readonly timeRange = input.required<TimeRange>();
  readonly filters = input<FilterBarItem[]>([]);
  readonly aggregation = input<ChartAggregation>(ChartAggregation.AVG);
  readonly pclValue = input<number>(90);
  readonly grouping = input<string[]>([]);
  readonly config = input<StandaloneChartConfig>({});
  readonly colorsPool = input<TimeseriesColorsPool>(new TimeseriesColorsPool());

  @Output() zoomReset = new EventEmitter<void>();
  @Output() zoomChange = new EventEmitter<TimeRange>();

  private readonly _timeSeriesService = inject(TimeSeriesService);
  private readonly _uPlotUtils = inject(UPlotUtilsService);

  protected chartSettings?: TSChartSettings;

  private readonly _fetchParams = computed(() => ({
    timeRange: this.timeRange(),
    metricKey: this.metricKey(),
    filters: this.filters(),
    aggregation: this.aggregation(),
    pclValue: this.pclValue(),
    grouping: this.grouping(),
    config: this.config(),
    colorsPool: this.colorsPool(),
  }));

  private readonly _fetchSub = toObservable(this._fetchParams)
    .pipe(
      switchMap(({ timeRange }) => this.fetchDataAndCreateChart(timeRange)),
      takeUntilDestroyed(),
    )
    .subscribe();

  private fetchDataAndCreateChart(range: TimeRange): Observable<TimeSeriesAPIResponse> {
    if (range.from >= range.to) {
      throw new Error(`Invalid time range ${JSON.stringify(range)}`);
    }
    const groupDimensions = this.grouping();
    const request: FetchBucketsRequest = {
      start: range.from,
      end: range.to,
      metricType: this.metricKey(),
      oqlFilter: this.composeRequestFilter(),
      groupDimensions: groupDimensions,
      percentiles: this.getRequiredPercentiles(this.aggregation()),
    };
    if (this.config().resolution) {
      request.intervalSize = this.config().resolution;
    } else {
      request.numberOfBuckets = 100;
    }
    return this._timeSeriesService.fetchBucketsWithFallback(request).pipe(
      tap((response) => {
        this.createChart(response);
      }),
    );
  }

  private createChart(response: TimeSeriesAPIResponse): void {
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const primaryAggregation = this.aggregation();
    const hasZAxes = this.config().showZAxes;
    const zAxesAggregation = ChartAggregation.RATE;
    const zAxesData: (number | undefined | null)[] = [];
    const series: TSChartSeries[] = response.matrix.map((seriesBuckets: BucketResponse[], i: number) => {
      const metadata: any[] = [];
      let labelItems = this.grouping().map((field) => response.matrixKeys[i]?.[field]);
      if (this.grouping().length === 0) {
        labelItems = [this.metricKey()];
      }
      const seriesKey = this.mergeLabelItems(labelItems);
      const color = this.colorsPool().getSeriesColor(seriesKey).color;

      const seriesData: (number | undefined | null)[] = [];
      seriesBuckets.forEach((b, i) => {
        if (hasZAxes) {
          const bucketValue = this.getBucketValue(b, zAxesAggregation, response.interval);
          if (zAxesData[i] == undefined) {
            zAxesData[i] = bucketValue;
          } else if (bucketValue) {
            zAxesData[i]! += bucketValue;
          }
        }
        seriesData[i] = this.getBucketValue(b, primaryAggregation!, response.interval);
      });
      const s: TSChartSeries = {
        id: seriesKey,
        pxAlign: 1,
        min: 50,
        scale: 'y',
        labelItems: labelItems,
        legendName: seriesKey,
        data: seriesData,
        metadata: metadata,
        value: (self, x) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(x),
        stroke: color,
        points: { show: false },
        show: true,
      };
      if (this.config().colorizationType === 'FILL') {
        s.fill = (self, seriesIdx: number) => this._uPlotUtils.gradientFill(self, color);
      }
      return s;
    });
    const primaryUnit = this.config().primaryAxesUnit;
    const yAxesUnit = this.getUnitLabel(primaryAggregation, primaryUnit);

    const axes: Axis[] = [
      {
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        scale: 'y',
        values: (u, vals) => {
          return vals.map((v: any) => TimeSeriesUtils.getAxesFormatFunction(primaryAggregation, primaryUnit)(v));
        },
        show: this.config().showYAxes ?? true,
      },
    ];
    if (hasZAxes) {
      axes.push({
        // @ts-ignore
        scale: TimeSeriesConfig.SECONDARY_AXES_KEY,
        side: 1,
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        values: (u: unknown, vals: number[]) =>
          vals.map((v) => TimeSeriesUtils.getAxesFormatFunction(zAxesAggregation, undefined)(v)),
        grid: { show: false },
      });
      series.unshift({
        scale: TimeSeriesConfig.SECONDARY_AXES_KEY,
        labelItems: ['Total'],
        id: 'total',
        data: zAxesData,
        value: (x, v: number) => Math.trunc(v) + ' total',
        fill: TimeSeriesConfig.TOTAL_BARS_COLOR,
        paths: this.barsFunction({ size: [1, 100, 4], radius: 0.2, gap: 1 }),
        points: { show: false },
      });
    }

    this.chartSettings = {
      title: this.config().title || '',
      xAxesSettings: {
        values: xLabels,
        show: this.config().showTimeAxes,
      },
      series: series,
      tooltipOptions: {
        enabled: this.config().showTooltip ?? true,
        zAxisLabel: this.config().tooltipYAxesUnit,
        yAxisUnit: yAxesUnit,
      },
      zoomEnabled: this.config().zoomEnabled,
      showLegend: this.config().showLegend,
      showCursor: this.config().showCursor,
      axes: axes,
      truncated: response.truncated,
    };
  }

  private mergeLabelItems(items: (string | undefined)[]): string {
    if (items.length === 0) {
      return this.metricKey();
    }
    return items.map((i) => i ?? TimeSeriesConfig.SERIES_LABEL_EMPTY).join(' | ');
  }

  private getBucketValue(
    b: BucketResponse,
    aggregation: ChartAggregation,
    bucketIntervalMs: number,
  ): number | undefined | null {
    if (!b) {
      return 0;
    }
    switch (aggregation) {
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
        if (this.metricKey() === 'counter') {
          return b.sum / (bucketIntervalMs / 3_600_000);
        }
        return b.throughputPerHour;
      case 'MEDIAN':
        return b.pclValues?.[50];
      case 'PERCENTILE':
        return b.pclValues?.[this.pclValue()];
      default:
        throw new Error('Unhandled aggregation value: ' + aggregation);
    }
  }

  private getUnitLabel(aggregation: ChartAggregation, unit?: string): string {
    if (aggregation === 'RATE') {
      return '/ h';
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

  private getRequiredPercentiles(aggregate: ChartAggregation): number[] {
    const percentilesToRequest: number[] = [];
    if (aggregate === ChartAggregation.MEDIAN) {
      percentilesToRequest.push(50);
    }
    if (aggregate === ChartAggregation.PERCENTILE) {
      percentilesToRequest.push(80, 90, 99);
    }
    return percentilesToRequest;
  }

  protected handleZoomReset(): void {
    this.zoomReset.emit();
    this.fetchDataAndCreateChart(this.timeRange()).subscribe();
  }

  protected handleZoomChange(range: TimeRange): void {
    this.zoomChange.emit(range);
    this.fetchDataAndCreateChart(range).subscribe();
  }

  private composeRequestFilter(): string {
    const metricFilterItem = {
      attributeName: 'metricType',
      type: FilterBarItemType.FREE_TEXT,
      exactMatch: true,
      freeTextValues: [`"${this.metricKey()}"`],
      searchEntities: [],
    };
    const filters: FilterBarItem[] = [metricFilterItem, ...this.filters()];
    return FilterUtils.filtersToOQL(filters, 'attributes');
  }
}
