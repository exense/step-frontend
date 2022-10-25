import { tap } from 'rxjs';
import { TimeSeriesUtils } from '../../time-series-utils';
import { TSChartSeries, TSChartSettings } from '../../chart/model/ts-chart-settings';
import { UPlotUtils } from '../../uplot/uPlot.utils';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesChartResponse } from '../../time-series-chart-response';
import { ChartGenerators } from './chart-generators';
import { TimeseriesColorsPool } from '../../util/timeseries-colors-pool';
import { TimeSeriesConfig } from '../../time-series.config';

declare const uPlot: any;

export class ByStatusChartGenerator {
  static readonly STATUS_ATTRIBUTE = 'rnStatus';

  static createChart(
    request: FindBucketsRequest,
    response: TimeSeriesChartResponse,
    colorsPool?: TimeseriesColorsPool
  ): TSChartSettings {
    if (!colorsPool) {
      throw 'Colors pool is mandatory for this type of chart';
    }
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const series: TSChartSeries[] = response.matrix.map((series, i) => {
      let status = response.matrixKeys[i][this.STATUS_ATTRIBUTE];
      let color = colorsPool.getStatusColor(status);
      status = status || 'No Status';

      return {
        id: status,
        label: status,
        data: series.map((b) => (b ? b.throughputPerHour : 0)),
        // scale: 'mb',
        value: (self, x) => TimeSeriesUtils.formatAxisValue(x) + '/h',
        stroke: color,
        fill: (self: uPlot, seriesIdx: number) => UPlotUtils.gradientFill(self, color),
        points: { show: false },
      };
    });
    return {
      title: 'Statuses',
      showLegend: true,
      xValues: xLabels,
      series: series,
      yScaleUnit: '/ h',
      axes: [
        {
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          label: 'Total',
          labelSize: 24,
          stroke: '#bfcbec',
          scale: 'total',
          values: (u, vals, space) => vals.map((v) => TimeSeriesUtils.formatAxisValue(v) + '/h'),
        },
      ],
    };
  }
}
