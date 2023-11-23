import { FindBucketsRequest } from '../../find-buckets-request';
import { TSChartSeries, TSChartSettings } from '../../chart/model/ts-chart-settings';
import { TimeSeriesUtils } from '../../time-series-utils';
import { UPlotUtils } from '../../uplot/uPlot.utils';
import { ChartGenerators } from './chart-generators';
import { TimeSeriesConfig } from '../../time-series.config';
import { TimeseriesColorsPool } from '../../util/timeseries-colors-pool';
import { TimeSeriesAPIResponse } from '@exense/step-core';

declare const uPlot: any;

export class ThreadGroupChartGenerator {
  static readonly DIMENSION_KEY = 'name';

  static createChart(
    request: FindBucketsRequest,
    response: TimeSeriesAPIResponse,
    colorsPool: TimeseriesColorsPool
  ): TSChartSettings {
    if (!colorsPool) {
      throw 'Colors pool is mandatory';
    }
    const timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const totalData: number[] = response.matrix[0] ? Array(response.matrix[0].length) : [];
    const dynamicSeries = response.matrixKeys.map((key, i) => {
      const seriesKey: string = key[this.DIMENSION_KEY]; // get just the name
      let filledData = response.matrix[i].map((b, j) => {
        let bucketValue = b?.max;
        if (bucketValue == null && j > 0) {
          // we try to keep a constant line
          let previousBucket = response.matrix[i][j - 1];
          bucketValue = previousBucket?.max;
          response.matrix[i][j] = previousBucket;
        }
        if (totalData[j] === undefined) {
          totalData[j] = bucketValue;
        } else if (bucketValue) {
          totalData[j] += bucketValue;
        }
        return bucketValue;
      });
      let useRandomColors = response.matrixKeys.length > 1;
      return {
        id: seriesKey,
        scale: 'y',
        label: seriesKey,
        labelItems: [seriesKey],
        legendName: seriesKey,
        data: filledData,
        value: (x, v) => Math.trunc(v),
        stroke: useRandomColors ? colorsPool.getColor(seriesKey) : '#024981',
        width: 2,
        paths: ChartGenerators.stepped({ align: 1 }),
        points: { show: false },
      } as TSChartSeries;
    });
    return {
      title: 'Thread Groups (Concurrency)',
      xValues: timeLabels,
      cursor: {
        dataIdx: UPlotUtils.closestNotEmptyPointFunction,
      },
      tooltipOptions: {
        enabled: true,
      },
      series: [
        {
          id: 'total',
          scale: 'total',
          label: 'Total',
          labelItems: ['Total'],
          legendName: 'Total',
          data: totalData,
          value: (x, v) => Math.trunc(v),
          fill: (self: uPlot) => UPlotUtils.gradientFill(self, TimeSeriesConfig.TOTAL_BARS_COLOR),
          paths: ChartGenerators.stepped({ align: 1 }),
          points: { show: false },
        },
        ...dynamicSeries,
      ],
      axes: [
        {
          scale: 'y',
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          values: (u, vals) => vals.map((v) => (v === Math.floor(v) ? v : null)),
        },
        {
          side: 1,
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'total',
          values: (u, vals) => vals.map((v) => (v === Math.floor(v) ? v : null)),
          grid: { show: false },
        },
      ],
    };
  }
}
