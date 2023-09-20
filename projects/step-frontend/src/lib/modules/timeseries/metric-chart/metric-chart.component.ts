import { AfterViewInit, Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TSChartSettings } from '../chart/model/ts-chart-settings';
import { MetricChartSettings, MetricDefaultSettings } from './metric-default-settings';
import { MetricChartType } from './metric-chart-type';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { BucketResponse, FetchBucketsRequest, TimeSeriesAPIResponse, TimeSeriesService } from '@exense/step-core';
import { TimeSeriesUtils } from '../time-series-utils';
import { UPlotUtils } from '../uplot/uPlot.utils';
import { TimeSeriesConfig } from '../time-series.config';
import { ChartGenerators } from '../performance-view/chart-generators/chart-generators';

//@ts-ignore
import uPlot = require('uplot');
import { FilterUtils } from '../util/filter-utils';

@Component({
  selector: 'step-metric-chart',
  templateUrl: './metric-chart.component.html',
  styleUrls: ['./metric-chart.component.scss'],
})
export class MetricChartComponent implements OnInit, OnChanges {
  chartSettings?: TSChartSettings;

  @Input() metric!: MetricChartType;
  @Input() range!: TSTimeRange;

  private _timeSeriesService = inject(TimeSeriesService);

  ngOnInit(): void {
    if (!this.metric) {
      throw new Error('Metric input is mandatory');
    }
    if (!this.range) {
      throw new Error('Range input is mandatory');
    }
    const settings = MetricDefaultSettings.getSettings(this.metric);
    const request: FetchBucketsRequest = {
      start: this.range.from,
      end: this.range.to,
      groupDimensions: ['name'],
      oqlFilter: FilterUtils.objectToOQL({ 'attributes.metricType': settings.metricAttribute }),
      numberOfBuckets: 100,
    };
    this._timeSeriesService.getBuckets(request).subscribe((response) => {
      this.chartSettings = this.createChartSettings(settings, response);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // TODO handle range change
    // TODO handle metric change
    console.log('CHANGES');
  }

  private createChartSettings(settings: MetricChartSettings, response: TimeSeriesAPIResponse): TSChartSettings {
    let xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    let avgValues: (number | null | undefined)[] = [];
    let countValues: (number | null)[] = [];
    if (response.matrixKeys.length !== 0) {
      response.matrix[0].forEach((bucket) => {
        avgValues.push(bucket ? Math.round(bucket.sum / bucket.count) : undefined);
        countValues.push(bucket ? bucket.throughputPerHour : 0);
      });
    }

    return {
      title: settings.title,
      xValues: xLabels,
      tooltipOptions: {
        enabled: true,
        yAxisUnit: 'ms',
        zAxisLabel: 'Hits/h',
      },
      series: [
        {
          id: 'avg',
          scale: 'y',
          label: 'Response Time',
          data: avgValues,
          value: (x, v) => Math.trunc(v) + ' ms',
          width: 2,
          stroke: 'rgba(255,109,18,0.59)',
          legendName: 'Average Response Time',
        },
        {
          id: 'count',
          scale: 'total',
          legendName: 'Hits/h',
          label: 'Hits/h',
          data: countValues,
          value: (x, v: number) => Math.trunc(v),
          fill: (self: uPlot) => UPlotUtils.gradientFill(self, TimeSeriesConfig.TOTAL_BARS_COLOR),
          paths: ChartGenerators.barsFunction({ size: [0.9, 100] }),
          points: { show: false },
        },
      ],
      axes: [
        {
          scale: 'y',
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          values: (u, vals, space) => vals.map((v: number) => UPlotUtils.formatMilliseconds(v)),
        },
        {
          side: 1,
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'total',
          values: (u: any, vals: any, space: any) => vals.map((v: number) => TimeSeriesUtils.formatAxisValue(v) + '/h'),
          grid: { show: false },
        },
      ],
      autoResize: true,
    };
  }
}
