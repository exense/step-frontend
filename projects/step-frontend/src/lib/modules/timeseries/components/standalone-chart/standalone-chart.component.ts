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

@Component({
  selector: 'step-standalone-dashlet',
  templateUrl: './standalone-chart.component.html',
  styleUrls: ['./standalone-chart.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS, ChartSkeletonComponent, TimeSeriesChartComponent],
})
export class StandaloneChartComponent implements OnChanges {
  @ViewChild('chart') chart!: TimeSeriesChartComponent;

  @Input() metricKey!: string;
  @Input() filters: FilterBarItem[] = [];
  @Input() timeRange!: TimeRange;
  @Input() aggregation: ChartAggregation = ChartAggregation.AVG;
  @Input() pclValue: number = 90; // used only when aggregation is PERCENTILE
  @Input() grouping: string[] = [];
  @Input() config: StandaloneChartConfig = {};
  @Input() colorsPool: TimeseriesColorsPool = new TimeseriesColorsPool();

  @Output() zoomReset = new EventEmitter<void>();
  @Output() zoomChange = new EventEmitter<TimeRange>();

  private _timeSeriesService = inject(TimeSeriesService);
  private _uPlotUtils = inject(UPlotUtilsService);

  chartSettings?: TSChartSettings;

  ngOnChanges(changes: SimpleChanges): void {
    this.validateInputs();
    this.fetchDataAndCreateChart(this.timeRange).subscribe();
  }

  private fetchDataAndCreateChart(range: TimeRange) {
    const groupDimensions = this.grouping;
    const request: FetchBucketsRequest = {
      start: range.from,
      end: range.to,
      oqlFilter: this.composeRequestFilter(),
      groupDimensions: groupDimensions,
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
    const series: TSChartSeries[] = response.matrix.map((seriesBuckets: BucketResponse[], i: number) => {
      const metadata: any[] = []; // here we can store meta info, like execution links or other attributes
      let labelItems = this.grouping.map((field) => response.matrixKeys[i]?.[field]);
      if (this.grouping.length === 0) {
        labelItems = [this.metricKey];
      }
      const seriesKey = this.mergeLabelItems(labelItems);
      const color = this.colorsPool.getColor(seriesKey);

      const seriesData: (number | undefined | null)[] = [];
      seriesBuckets.forEach((b, i) => {
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

  private validateInputs() {
    if (!this.metricKey) {
      throw new Error('Metric input is required');
    }
    if (!this.aggregation) {
      throw new Error('Aggregation input is required');
    }
    if (!this.timeRange || this.timeRange.from >= this.timeRange.to) {
      throw new Error('Invalid time range input');
    }
    if (!this.grouping) {
      throw new Error('Grouping input is required');
    }
    if (!this.config) {
      throw new Error('Config input is required');
    }
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
