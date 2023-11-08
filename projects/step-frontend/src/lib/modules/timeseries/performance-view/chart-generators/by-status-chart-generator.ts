import { TimeSeriesUtils } from '../../time-series-utils';
import { TSChartSeries, TSChartSettings } from '../../chart/model/ts-chart-settings';
import { UPlotUtils } from '../../uplot/uPlot.utils';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeseriesColorsPool } from '../../util/timeseries-colors-pool';
import { TimeSeriesConfig } from '../../time-series.config';
import { TimeSeriesAPIResponse } from '@exense/step-core';

declare const uPlot: any;

export class ByStatusChartGenerator {
  static readonly STATUS_ATTRIBUTE = 'rnStatus';

  static createChart(
    request: FindBucketsRequest,
    response: TimeSeriesAPIResponse,
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
      const metadata: any[] = [];
      const data: any[] = [];
      series.forEach((b) => {
        data.push(b ? b.throughputPerHour : 0);
        metadata.push(b?.attributes);
      });
      return {
        id: status,
        label: status,
        legendName: status,
        data: data,
        // scale: 'mb',
        metadata: metadata,
        value: (self, x) => TimeSeriesUtils.formatAxisValue(x) + '/h',
        stroke: color,
        fill: (self: uPlot, seriesIdx: number) => UPlotUtils.gradientFill(self, color),
        points: { show: false },
        show: true,
      };
    });
    return {
      title: 'Statuses',
      xValues: xLabels,
      series: series,
      tooltipOptions: {
        enabled: true,
        yAxisUnit: '/ h',
      },
      axes: [
        {
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'y',
          values: (u, vals, space) => vals.map((v) => TimeSeriesUtils.formatAxisValue(v) + '/h'),
        },
      ],
    };
  }
}
