import { Component, inject, Input, OnInit } from '@angular/core';
import { Dashlet } from '../model/dashlet';
import {
  BucketAttributes,
  BucketResponse,
  ChartSettings,
  DashboardItem,
  FetchBucketsRequest,
  MetricAttribute,
  TimeRangeSelection,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { FilterUtils } from '../../../util/filter-utils';
import { TSTimeRange } from '../../../chart/model/ts-time-range';
import { TSChartSeries, TSChartSettings } from '../../../chart/model/ts-chart-settings';
import { TimeSeriesUtils } from '../../../time-series-utils';
import { TimeSeriesConfig } from '../../../time-series.config';
import { UPlotUtils } from '../../../uplot/uPlot.utils';
import { TimeSeriesContext } from '../../../time-series-context';
import { TimeseriesColorsPool } from '../../../util/timeseries-colors-pool';

type AggregationType = 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';

interface MetricAttributeSelection extends MetricAttribute {
  selected: boolean;
}

@Component({
  selector: 'step-chart-dashlet',
  templateUrl: './chart-dashlet.component.html',
  styleUrls: ['./chart-dashlet.component.scss'],
})
export class ChartDashletComponent implements OnInit, Dashlet {
  readonly AGGREGATES: AggregationType[] = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'RATE', 'MEDIAN'];

  @Input() name!: string;
  @Input() settings!: ChartSettings;
  @Input() timeRange!: TSTimeRange;
  @Input() context: TimeSeriesContext;
  @Input() colorsPool: TimeseriesColorsPool;

  groupingSelection: MetricAttributeSelection[] = [];

  private _timeSeriesService = inject(TimeSeriesService);

  ngOnInit(): void {
    if (!this.name || !this.settings || !this.timeRange) {
      throw new Error('Missing input values');
    }
    const settings = this.settings;

    this.groupingSelection = settings.attributes?.map((a) => ({ ...a, selected: false })) || [];
    this.settings.grouping.forEach((a) => {
      const foundAttribute = this.groupingSelection.find((attr) => attr.name === a);
      if (foundAttribute) {
        foundAttribute.selected = true;
      }
    });

    this.createChart();
  }

  private createChart(): void {
    const groupDimensions = this.getChartGrouping();
    const request: FetchBucketsRequest = {
      start: this.timeRange.from,
      end: this.timeRange.to,
      groupDimensions: groupDimensions,
      oqlFilter: FilterUtils.objectToOQL({ 'attributes.metricType': `"${this.settings.metricKey!}"` }),
      numberOfBuckets: 100,
      percentiles: this.getChartPclToRequest(this.settings.primaryAxes!.aggregation!),
    };
    this._timeSeriesService.getTimeSeries(request).subscribe((response) => {
      const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
      const primaryAxes = this.settings.primaryAxes!;
      const primaryAggregation = primaryAxes.aggregation!;
      const series: TSChartSeries[] = response.matrix.map((series, i) => {
        const labelItems = this.getSeriesKeys(response.matrixKeys[i], groupDimensions);
        const seriesKey = labelItems.join(' | ');
        const color = primaryAxes.renderingSettings?.seriesColors?.[seriesKey] || this.colorsPool.getColor(seriesKey);

        return {
          id: seriesKey,
          label: seriesKey,
          labelItems: labelItems,
          legendName: seriesKey,
          data: series.map((b) => this.getBucketValue(b, primaryAggregation!)),
          value: (self, x) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(x),
          stroke: color,
          fill: (self: uPlot, seriesIdx: number) => UPlotUtils.gradientFill(self, color),
          points: { show: false },
          show: true,
        };
      });
      const primaryUnit = primaryAxes.unit!;
      const yAxesUnit = this.getUnitLabel(primaryAggregation, primaryUnit);

      return {
        title: `${name} (${primaryAggregation})`,
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
              return vals.map((v) => this.getAxesFormatFunction(primaryAggregation, primaryUnit)(v));
            },
          },
        ],
      };
    });
  }

  private getChartGrouping(): string[] {
    if (this.settings.inheritGlobalGrouping) {
      return this.context.getGroupDimensions();
    } else {
      return this.groupingSelection.filter((s) => s.selected).map((a) => a.name);
    }
  }

  private getAxesFormatFunction(aggregation: AggregationType, unit: string): (v: number) => string {
    if (!unit) {
      return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber;
    }
    if (aggregation === 'RATE') {
      return (v) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v) + '/h';
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

  private getUnitLabel(aggregation: AggregationType, unit: string): string {
    if (aggregation === 'RATE') {
      return '/h';
    }
    if (unit === '%') {
      return '%';
    } else if (unit === 'ms') {
      return ' ms';
    } else {
      return '';
    }
  }

  private getChartPclToRequest(aggregation: AggregationType): number[] {
    switch (aggregation) {
      case 'MEDIAN':
        return [50];
      case 'PERCENTILE':
        return [90, 98, 99];
      default:
        return [];
    }
  }

  private getBucketValue(b: BucketResponse, aggregation: AggregationType): number | undefined {
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
      // return b.pclValues?.[this.selectedPclValue];
      default:
        throw new Error('Unhandled aggregation value: ' + aggregation);
    }
  }

  private getSeriesKeys(attributes: BucketAttributes, groupDimensions: string[]): (string | undefined)[] {
    if (Object.keys(attributes).length === 0) {
      return [undefined];
    }
    return groupDimensions.map((field) => attributes[field]);
  }
}
