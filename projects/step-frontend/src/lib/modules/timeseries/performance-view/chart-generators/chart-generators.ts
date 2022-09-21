import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesUtils } from '../../time-series-utils';
import { UPlotUtils } from '../../uplot/uPlot.utils';
import { TimeSeriesChartResponse } from '../../time-series-chart-response';
import { TSChartSettings } from '../../chart/model/ts-chart-settings';
import { TsChartType } from '../ts-chart-type';

declare const uPlot: any;

export class ChartGenerators {
  private static readonly CHART_LEGEND_SIZE = 65;

  private static readonly barsFunction = uPlot.paths.bars; // this is a function from uplot which allows to draw bars instead of straight lines
  private static readonly stepped = uPlot.paths.stepped; // this is a function from uplot wich allows to draw 'stepped' or 'stairs like' lines

  static generateChart(
    type: TsChartType,
    request: FindBucketsRequest,
    response: TimeSeriesChartResponse
  ): TSChartSettings {
    switch (type) {
      case TsChartType.OVERVIEW:
        return this.createSummaryChartSettings(request, response);
      case TsChartType.BY_STATUS:
      case TsChartType.RESPONSE_TIME:
      case TsChartType.THROUGHPUT:
      case TsChartType.THREAD_GROUP:
        throw 'Not implemented';
    }
  }

  static createSummaryChartSettings(request: FindBucketsRequest, response: TimeSeriesChartResponse): TSChartSettings {
    let xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    let avgValues: (number | null)[] = [];
    let countValues: (number | null)[] = [];
    if (response.matrixKeys.length !== 0) {
      response.matrix[0].forEach((bucket) => {
        avgValues.push(bucket ? Math.trunc(bucket.sum / bucket.count) : null);
        countValues.push(bucket?.throughputPerHour);
      });
    }

    return {
      title: 'Performance Overview',
      showLegend: true,
      xValues: xLabels,
      yScaleUnit: 'ms',
      series: [
        {
          id: 'avg',
          scale: 'y',
          label: 'Response Time',
          data: avgValues,
          value: (x, v) => Math.trunc(v) + ' ms',
          width: 2,
          stroke: 'rgba(255,109,18,0.59)',
        },
        {
          id: 'count',
          scale: 'total',
          label: 'Hits/h',
          data: countValues,
          value: (x, v) => Math.trunc(v),
          fill: 'rgba(143,161,210,0.38)',
          paths: this.barsFunction({ size: [0.9, 100] }),
          points: { show: false },
        },
      ],
      axes: [
        {
          scale: 'y',
          size: this.CHART_LEGEND_SIZE,
          values: (u, vals, space) => vals.map((v: number) => UPlotUtils.formatMilliseconds(v)),
        },
        {
          side: 1,
          size: this.CHART_LEGEND_SIZE,
          scale: 'total',
          values: (u: any, vals: any, space: any) => vals.map((v: number) => TimeSeriesUtils.formatAxisValue(v)),
          grid: { show: false },
        },
      ],
      autoResize: true,
    };
  }
}
