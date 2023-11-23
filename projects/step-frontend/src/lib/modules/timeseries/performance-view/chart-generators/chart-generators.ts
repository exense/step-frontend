import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesUtils } from '../../time-series-utils';
import { UPlotUtils } from '../../uplot/uPlot.utils';
import { TSChartSettings } from '../../chart/model/ts-chart-settings';
import { TsChartType } from '../model/ts-chart-type';
import { ThreadGroupChartGenerator } from './thread-group-chart-generator';
import { ByStatusChartGenerator } from './by-status-chart-generator';
import { TimeseriesColorsPool } from '../../util/timeseries-colors-pool';
import { TimeSeriesConfig } from '../../time-series.config';
import { TimeSeriesAPIResponse } from '@exense/step-core';

declare const uPlot: any;

export class ChartGenerators {
  static readonly barsFunction = uPlot.paths.bars; // this is a function from uplot which allows to draw bars instead of straight lines
  static readonly stepped = uPlot.paths.stepped; // this is a function from uplot wich allows to draw 'stepped' or 'stairs like' lines

  static generateChart(
    type: TsChartType,
    request: FindBucketsRequest,
    response: TimeSeriesAPIResponse,
    colorsPool?: TimeseriesColorsPool
  ): TSChartSettings {
    switch (type) {
      case TsChartType.OVERVIEW:
        return this.createSummaryChartSettings(request, response);
      case TsChartType.BY_STATUS:
        return ByStatusChartGenerator.createChart(request, response, colorsPool);
      case TsChartType.THREAD_GROUP:
        return ThreadGroupChartGenerator.createChart(request, response, colorsPool!);
      case TsChartType.RESPONSE_TIME:
      case TsChartType.THROUGHPUT:
        throw 'Not implemented exception';
    }
  }

  static createSummaryChartSettings(request: FindBucketsRequest, response: TimeSeriesAPIResponse): TSChartSettings {
    let xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    let avgValues: (number | null | undefined)[] = [];
    let countValues: (number | null)[] = [];
    const metadata: any[] = [];
    if (response.matrixKeys.length !== 0) {
      response.matrix[0].forEach((bucket) => {
        avgValues.push(bucket ? Math.round(bucket.sum / bucket.count) : undefined);
        countValues.push(bucket ? bucket.throughputPerHour : 0);
        metadata.push(bucket?.attributes);
      });
    }

    return {
      title: 'Performance Overview',
      xValues: xLabels,
      tooltipOptions: {
        enabled: true,
        yAxisUnit: ' ms',
        zAxisLabel: 'Hits/h',
      },
      series: [
        {
          id: 'avg',
          scale: 'y',
          label: 'Response Time',
          labelItems: ['Response Time'],
          data: avgValues,
          metadata: metadata,
          value: (x, v) => Math.trunc(v) + ' ms',
          width: 2,
          stroke: 'rgba(255,109,18,0.59)',
          legendName: 'Average Response Time',
          show: true,
        },
        {
          id: 'count',
          scale: 'total',
          legendName: 'Hits/h',
          label: 'Hits/h',
          labelItems: ['Hits/h'],
          data: countValues,
          value: (x, v) => Math.trunc(v),
          fill: (self: uPlot) => UPlotUtils.gradientFill(self, TimeSeriesConfig.TOTAL_BARS_COLOR),
          paths: this.barsFunction({ size: [0.9, 100] }),
          points: { show: false },
          show: true,
        },
      ],
      axes: [
        {
          scale: 'y',
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          values: (u, vals, space) => vals.map((v: number) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.time(v)),
        },
        {
          side: 1,
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'total',
          values: (u: any, vals: any, space: any) =>
            vals.map((v: number) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v) + '/h'),
          grid: { show: false },
        },
      ],
      autoResize: true,
    };
  }
}
