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

interface SelectableMetricAttribute extends MetricAttribute {
  isSelected: boolean;
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

  readonly AGGREGATES = ['SUM', 'AVG', 'MAX', 'MIN', 'COUNT', 'RATE', 'MEDIAN', 'PERCENTILE'];
  selectedAggregate!: string;
  selectedGrouping?: MetricAttribute[];

  metricAttributes: SelectableMetricAttribute[] = [];

  isLoading = false;

  private _timeSeriesService = inject(TimeSeriesService);

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Metric settings input is mandatory');
    }
    if (!this.range) {
      throw new Error('Range input is mandatory');
    }
    const renderingSettings = this.settings.renderingSettings!;
    this.metricAttributes = JSON.parse(JSON.stringify(this.settings.attributes));
    renderingSettings.defaultGroupingAttributes?.forEach((attr) => {
      const foundAttribute = this.metricAttributes.find((a) => a.value === attr);
      if (foundAttribute) {
        foundAttribute.isSelected = true;
      }
    });
    this.selectedAggregate = renderingSettings.defaultAggregation!;
    if (renderingSettings.defaultGroupingAttributes?.length) {
      // we have a default grouping
      this.selectedGrouping = this.settings.attributes?.filter(
        (a) =>
          renderingSettings.defaultGroupingAttributes &&
          renderingSettings.defaultGroupingAttributes?.indexOf(a.value!) >= 0
      );
    }
    this.fetchDataAndCreateChart(this.settings, this.range);
  }

  private fetchDataAndCreateChart(settings: MetricType, range: TSTimeRange): void {
    const groupDimensions: string[] = this.metricAttributes
      .filter((attr) => attr.isSelected === true)
      .map((attr) => attr.value!);
    const request: FetchBucketsRequest = {
      start: range.from,
      end: range.to,
      groupDimensions: groupDimensions,
      oqlFilter: FilterUtils.objectToOQL({ ...this.filters, 'attributes.metricType': `"${settings.key!}"` }),
      numberOfBuckets: 100,
    };
    this._timeSeriesService.getBuckets(request).subscribe((response) => {
      this.isLoading = false;
      this.chartSettings = this.createChartSettings(response, groupDimensions);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['settings']?.previousValue || changes['range']?.previousValue) {
      this.fetchDataAndCreateChart(this.settings, this.range);
    }
  }

  switchGrouping(attribute: MetricAttribute | undefined) {
    this.isLoading = true;
    // this.selectedGrouping = attribute;
    this.fetchDataAndCreateChart(this.settings, this.range);
  }

  switchAggregate(aggregate: string) {
    this.isLoading = true;
    this.selectedAggregate = aggregate;
    this.fetchDataAndCreateChart(this.settings, this.range);
  }

  private createChartSettings(response: TimeSeriesAPIResponse, groupDimensions: string[]): TSChartSettings {
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const series: TSChartSeries[] = response.matrix.map((series, i) => {
      const seriesLabel = this.getSeriesKey(response.matrixKeys[i], groupDimensions);
      const color = '#2461cc';
      return {
        id: seriesLabel,
        label: seriesLabel,
        legendName: seriesLabel,
        data: series.map((b) => this.getBucketValue(b, this.selectedAggregate)),
        value: (self, x) => x,
        stroke: color,
        fill: (self: uPlot, seriesIdx: number) => UPlotUtils.gradientFill(self, color),
        points: { show: false },
      };
    });
    let yAxesUnit = this.getUnitLabel(this.settings.renderingSettings!.unit!);
    return {
      title: `${this.settings.name!} (${this.selectedAggregate})`,
      xValues: xLabels,
      series: series,
      tooltipOptions: {
        enabled: true,
        yAxisUnit: yAxesUnit,
      },
      axes: [
        {
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'y',
          values: (u, vals, space) => {
            return vals.map((v) => v + ' ' + yAxesUnit);
          },
        },
      ],
    };
  }

  private getBucketValue(b: BucketResponse, aggregation: string): number {
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
      case 'MEDIAN':
      case 'PERCENTILE':
      default:
        throw new Error('Unhandled aggregation value: ' + aggregation);
    }
  }

  private getUnitLabel(unit: 'MS' | 'PERCENTAGE' | 'EMPTY'): string {
    switch (unit) {
      case 'MS':
        return 'ms';
      case 'PERCENTAGE':
        return '%';
      case 'EMPTY':
        return '';
      default:
        throw new Error('Unhandled unit value: ' + unit);
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
