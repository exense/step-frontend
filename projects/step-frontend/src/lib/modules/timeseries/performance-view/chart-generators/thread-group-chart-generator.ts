import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesChartResponse } from '../../time-series-chart-response';
import { TSChartSeries, TSChartSettings } from '../../chart/model/ts-chart-settings';
import { TimeSeriesUtils } from '../../time-series-utils';
import { UPlotUtils } from '../../uplot/uPlot.utils';
import { ChartGenerators } from './chart-generators';
import { TimeSeriesConfig } from '../../time-series.config';
import { TimeseriesColorsPool } from '../../util/timeseries-colors-pool';

declare const uPlot: any;

export class ThreadGroupChartGenerator {
  static readonly DIMENSION_KEY = 'name';

  static createChart(
    request: FindBucketsRequest,
    response: TimeSeriesChartResponse,
    colorsPool: TimeseriesColorsPool
  ): TSChartSettings {
    if (!colorsPool) {
      throw 'Colors pool is mandatory';
    }
    let timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    let totalData: number[] = response.matrix[0] ? Array(response.matrix[0].length) : [];
    let dynamicSeries = response.matrixKeys.map((key, i) => {
      key = key[this.DIMENSION_KEY]; // get just the name
      let filledData = response.matrix[i].map((b, j) => {
        let bucketValue = b?.max;
        if (bucketValue == null && j > 0) {
          // we try to keep a constant line
          bucketValue = response.matrix[i][j - 1]?.max;
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
        scale: 'y',
        label: key,
        id: key,
        data: filledData,
        value: (x, v) => Math.trunc(v),
        stroke: useRandomColors ? colorsPool.getColor(key) : '#024981',
        width: 2,
        paths: ChartGenerators.stepped({ align: 1 }),
        points: { show: false },
      } as TSChartSeries;
    });
    return {
      title: 'Thread Groups (Concurrency)',
      xValues: timeLabels,
      showLegend: true,
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
          data: totalData,
          value: (x, v) => Math.trunc(v),
          fill: (self: uPlot) => UPlotUtils.gradientFill(self, '#8FA1D2'),
          paths: ChartGenerators.stepped({ align: 1 }),
          points: { show: false },
        },
        ...dynamicSeries,
      ],
      axes: [
        {
          scale: 'y',
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          values: (u, vals, space) => vals.map((v) => v),
        },
        {
          side: 1,
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'total',
          values: (u, vals, space) => vals.map((v) => v),
          grid: { show: false },
        },
      ],
    };
  }
}
