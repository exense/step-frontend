import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  OQLBuilder,
  TimeseriesColorsPool,
  TimeSeriesConfig,
  TimeSeriesUtils,
  UPlotUtilsService,
} from '../../modules/_common';
import { ChartSkeletonComponent, TimeSeriesChartComponent, TSChartSeries, TSChartSettings } from '../../modules/chart';
import {
  BucketResponse,
  FetchBucketsRequest,
  TimeRange,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { tap } from 'rxjs';
import { Axis } from 'uplot';
import { StandaloneChartConfig } from './standalone-chart-config';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';

declare const uPlot: any;

@Component({
  selector: 'step-standalone-dashlet',
  templateUrl: './standalone-chart.component.html',
  styleUrls: ['./standalone-chart.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS, ChartSkeletonComponent, TimeSeriesChartComponent],
})
export class StandaloneChartComponent implements OnChanges {
  private readonly barsFunction = uPlot.paths.bars;
  @ViewChild('chart') chart!: TimeSeriesChartComponent;

  @Input({ required: true }) metricKey!: string;
  @Input({ required: true }) timeRange!: TimeRange;
  @Input({ transform: (value: FilterBarItem[] | undefined | null) => value || [] }) filters: FilterBarItem[] = [];
  @Input({ transform: (value: ChartAggregation | undefined | null) => value || ChartAggregation.AVG })
  aggregation: ChartAggregation = ChartAggregation.AVG;
  @Input({ transform: (value: number | undefined | null) => value || 90 }) pclValue: number = 90; // used only when aggregation is PERCENTILE
  @Input({ transform: (value: string[] | undefined | null) => value || [] }) grouping: string[] = [];
  @Input({ transform: (value: StandaloneChartConfig | undefined | null) => value || {} })
  config: StandaloneChartConfig = {};
  @Input({ transform: (value: TimeseriesColorsPool | undefined | null) => value || new TimeseriesColorsPool() })
  colorsPool: TimeseriesColorsPool = new TimeseriesColorsPool();

  @Output() zoomReset = new EventEmitter<void>();
  @Output() zoomChange = new EventEmitter<TimeRange>();

  private _timeSeriesService = inject(TimeSeriesService);
  private _uPlotUtils = inject(UPlotUtilsService);

  chartSettings?: TSChartSettings;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes');
    this.fetchDataAndCreateChart(this.timeRange).subscribe();
  }

  private fetchDataAndCreateChart(range: TimeRange) {
    const groupDimensions = this.grouping;
    const request: FetchBucketsRequest = {
      start: range.from,
      end: range.to,
      oqlFilter: this.composeRequestFilter(),
      groupDimensions: groupDimensions,
      percentiles: this.getRequiredPercentiles(this.aggregation),
    };
    if (this.config.resolution) {
      request.intervalSize = this.config.resolution;
    } else {
      request.numberOfBuckets = 100;
    }
    return this._timeSeriesService.getTimeSeries(request).pipe(
      tap((response) => {
        this.createChart(response);
      }),
    );
  }

  private createChart(response: TimeSeriesAPIResponse): void {
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const primaryAggregation = this.aggregation;
    const hasZAxes = this.config.showZAxes;
    const zAxesAggregation = ChartAggregation.RATE;
    const zAxesData: (number | undefined | null)[] = [];
    const series: TSChartSeries[] = response.matrix.map((seriesBuckets: BucketResponse[], i: number) => {
      const metadata: any[] = []; // here we can store meta info, like execution links or other attributes
      let labelItems = this.grouping.map((field) => response.matrixKeys[i]?.[field]);
      if (this.grouping.length === 0) {
        labelItems = [this.metricKey];
      }
      const seriesKey = this.mergeLabelItems(labelItems);
      const color = this.colorsPool.getSeriesColor(seriesKey).color;

      const seriesData: (number | undefined | null)[] = [];
      seriesBuckets.forEach((b, i) => {
        if (hasZAxes) {
          const bucketValue = this.getBucketValue(b, zAxesAggregation);
          if (zAxesData[i] == undefined) {
            zAxesData[i] = bucketValue;
          } else if (bucketValue) {
            zAxesData[i]! += bucketValue;
          }
        }
        seriesData[i] = this.getBucketValue(b, primaryAggregation!);
      });
      const s: TSChartSeries = {
        id: seriesKey,
        pxAlign: 1, // when not 0, the 0 values will be not visible on the chart when all axes are hidden
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
      if (this.config.colorizationType === 'FILL') {
        s.fill = (self, seriesIdx: number) => this._uPlotUtils.gradientFill(self, color);
      }
      return s;
    });
    const primaryUnit = this.config.primaryAxesUnit;
    const yAxesUnit = this.getUnitLabel(primaryAggregation, primaryUnit);

    const axes: Axis[] = [
      {
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        scale: 'y',
        values: (u, vals) => {
          return vals.map((v: any) => TimeSeriesUtils.getAxesFormatFunction(primaryAggregation, primaryUnit)(v));
        },
        show: this.config.showYAxes ?? true,
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
      title: this.config.title || '',
      xValues: xLabels,
      series: series,
      tooltipOptions: {
        enabled: this.config.showTooltip ?? true,
        zAxisLabel: this.config.tooltipYAxesUnit,
        yAxisUnit: yAxesUnit,
      },
      zoomEnabled: this.config.zoomEnabled,
      showLegend: this.config.showLegend,
      showCursor: this.config.showCursor,
      showTimeAxes: this.config.showTimeAxes,
      axes: axes,
      truncated: response.truncated,
    };
  }

  private mergeLabelItems(items: (string | undefined)[]): string {
    if (items.length === 0) {
      return this.metricKey;
    }
    return items.map((i) => i ?? TimeSeriesConfig.SERIES_LABEL_EMPTY).join(' | ');
  }

  private getBucketValue(b: BucketResponse, aggregation: ChartAggregation): number | undefined | null {
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
        return b.throughputPerHour;
      case 'MEDIAN':
        return b.pclValues?.[50];
      case 'PERCENTILE':
        return b.pclValues?.[this.pclValue];
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

  handleZoomReset() {
    this.zoomReset.emit();
    this.fetchDataAndCreateChart(this.timeRange).subscribe();
  }

  handleZoomChange(range: TimeRange) {
    this.zoomChange.emit(range);
    this.fetchDataAndCreateChart(range).subscribe();
  }

  private composeRequestFilter(): string {
    const metricFilterItem = {
      attributeName: 'metricType',
      type: FilterBarItemType.FREE_TEXT,
      exactMatch: true,
      freeTextValues: [`"${this.metricKey}"`],
      searchEntities: [],
    };
    const filters: FilterBarItem[] = [metricFilterItem, ...this.filters];
    return FilterUtils.filtersToOQL(filters, 'attributes');
  }
}
