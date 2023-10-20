import { AfterViewInit, Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TSChartSeries, TSChartSettings } from '../chart/model/ts-chart-settings';
import { TSTimeRange } from '../chart/model/ts-time-range';
import {
  BucketAttributes,
  BucketResponse,
  FetchBucketsRequest,
  MetricAttribute,
  MetricType,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { TimeSeriesUtils } from '../time-series-utils';
import { UPlotUtils } from '../uplot/uPlot.utils';
import { TimeSeriesConfig } from '../time-series.config';

//@ts-ignore
import uPlot = require('uplot');
import { FilterUtils } from '../util/filter-utils';
import { reduce } from 'rxjs';
import { TimeseriesColorsPool } from '../util/timeseries-colors-pool';

type AggregationType = 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';

interface MetricAttributeSelection extends MetricAttribute {
  selected: boolean;
}

@Component({
  selector: 'step-metric-chart',
  templateUrl: './metric-chart.component.html',
  styleUrls: ['./metric-chart.component.scss'],
})
export class MetricChartComponent implements OnInit, OnChanges {
  chartSettings?: TSChartSettings;

  @Input() filters: Record<string, any> = {};
  @Input() settings!: MetricType;
  @Input() range!: TSTimeRange;
  @Input() allowGroupingChange = true;
  @Input() allowMetricChange = true;
  @Input() colorsPool: TimeseriesColorsPool = new TimeseriesColorsPool();

  readonly AGGREGATES: AggregationType[] = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'RATE', 'MEDIAN', 'PERCENTILE'];
  selectedAggregate!: AggregationType;
  groupingAttributes: MetricAttributeSelection[] = [];

  isLoading = false;

  private _timeSeriesService = inject(TimeSeriesService);

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Metric settings input is mandatory');
    }
    if (!this.range) {
      throw new Error('Range input is mandatory');
    }
    this.groupingAttributes = this.settings.attributes?.map((a) => ({ ...a, selected: false })) || [];
    this.settings.defaultGroupingAttributes?.forEach((a) => {
      const foundAttribute = this.groupingAttributes.find((attr) => attr.value === a);
      if (foundAttribute) {
        foundAttribute.selected = true;
      }
    });
    this.selectedAggregate = this.settings.defaultAggregation || 'SUM';
    this.fetchDataAndCreateChart(this.settings, this.range);
  }

  private fetchDataAndCreateChart(settings: MetricType, range: TSTimeRange): void {
    const groupDimensions: string[] = this.groupingAttributes.filter((a) => a.selected).map((a) => a.value!);
    let pclValues: number[] | undefined;
    if (this.selectedAggregate === 'MEDIAN') {
      pclValues = [50];
    } else if (this.selectedAggregate === 'PERCENTILE') {
      pclValues = [80, 90, 99];
    }
    const request: FetchBucketsRequest = {
      start: range.from,
      end: range.to,
      groupDimensions: groupDimensions,
      oqlFilter: FilterUtils.objectToOQL({ ...this.filters, 'attributes.metricType': `"${settings.key!}"` }),
      numberOfBuckets: 100,
      percentiles: pclValues,
    };
    this._timeSeriesService.getTimeSeries(request).subscribe((response) => {
      this.isLoading = false;
      this.chartSettings = this.createChartSettings(response, groupDimensions);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['settings']?.previousValue || changes['range']?.previousValue) {
      this.fetchDataAndCreateChart(this.settings, this.range);
    }
  }

  toggleGroupingAttribute(attribute: MetricAttributeSelection) {
    this.isLoading = true;
    attribute.selected = !attribute.selected;
    this.fetchDataAndCreateChart(this.settings, this.range);
  }

  switchAggregate(aggregate: AggregationType) {
    this.isLoading = true;
    this.selectedAggregate = aggregate;
    this.fetchDataAndCreateChart(this.settings, this.range);
  }

  private createChartSettings(response: TimeSeriesAPIResponse, groupDimensions: string[]): TSChartSettings {
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const series: TSChartSeries[] = response.matrix.map((series, i) => {
      const seriesLabel = this.getSeriesKey(response.matrixKeys[i], groupDimensions);
      const color =
        this.settings.renderingSettings?.seriesColors?.[seriesLabel] || this.colorsPool.getColor(seriesLabel);
      return {
        id: seriesLabel,
        label: seriesLabel,
        legendName: seriesLabel,
        data: series.map((b) => this.getBucketValue(b, this.selectedAggregate!)),
        value: (self, x) => TimeSeriesUtils.formatNumericAxisValue(x),
        stroke: color,
        fill: (self: uPlot, seriesIdx: number) => UPlotUtils.gradientFill(self, color),
        points: { show: false },
        show: true,
      };
    });
    let yAxesUnit = this.getUnitLabel(this.settings);

    return {
      title: `${this.settings.name!} (${this.selectedAggregate})`,
      xValues: xLabels,
      series: series,
      tooltipOptions: {
        enabled: true,
        yAxisUnit: yAxesUnit,
      },
      showLegend: groupDimensions.length > 0, // in case it has grouping, display the legend
      axes: [
        {
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'y',
          values: (u, vals, space) => {
            return vals.map(
              (v) => this.getAxesFormatFunction(this.settings.unit)(v) + this.getUnitLabel(this.settings)
            );
          },
        },
      ],
    };
  }

  private getAxesFormatFunction(unit: undefined | 'MS' | 'PERCENTAGE' | 'EMPTY'): (v: number) => string {
    if (!unit) {
      return (v) => v.toString();
    }
    switch (unit) {
      case 'MS':
        return TimeSeriesUtils.formatTimeAxisValue;
      case 'PERCENTAGE':
        return (v) => v.toString();
      case 'EMPTY':
        return TimeSeriesUtils.formatNumericAxisValue;
    }
  }

  private getUnitLabel(metric: MetricType): string {
    if (metric.unit === 'PERCENTAGE') {
      return '%';
    } else {
      if (this.selectedAggregate === 'RATE') {
        return '/h';
      }
      return '';
    }
  }

  private getBucketValue(b: BucketResponse, aggregation: AggregationType): number {
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
        return b.pclValues?.[50] || 0;
      case 'PERCENTILE':
        return b.pclValues?.[90] || 0;
      default:
        throw new Error('Unhandled aggregation value: ' + aggregation);
    }
  }

  private getSeriesKey(attributes: BucketAttributes, groupDimensions: string[]): string {
    if (Object.keys(attributes).length === 0) {
      return 'Value';
    }
    return groupDimensions
      .map((field) => attributes[field])
      .filter((f) => !!f)
      .join(' | ');
  }
}
