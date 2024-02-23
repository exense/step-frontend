import { FetchBucketsRequest, TimeSeriesAPIResponse } from '@exense/step-core';
import { TimeSeriesUtils, TimeSeriesConfig, UPlotUtilsService, TimeseriesColorsPool } from '../../_common';
import { TSChartSeries, TSChartSettings } from '../../chart';
import { inject, Injectable } from '@angular/core';

declare const uPlot: any;

@Injectable({
  providedIn: 'root',
})
export class ByStatusChartGenerator {
  readonly STATUS_ATTRIBUTE = 'rnStatus';

  private _uPlotUtils = inject(UPlotUtilsService);

  createChart(
    request: FetchBucketsRequest,
    response: TimeSeriesAPIResponse,
    colorsPool?: TimeseriesColorsPool,
  ): TSChartSettings {
    if (!colorsPool) {
      throw 'Colors pool is mandatory for this type of chart';
    }
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const series: TSChartSeries[] = response.matrix.map((series, i) => {
      let status = response.matrixKeys[i][this.STATUS_ATTRIBUTE];
      const color = colorsPool.getStatusColor(status);
      status = status || 'No Status';
      const metadata: Record<string, any>[] = [];
      const data: (number | null | undefined)[] = [];
      series.forEach((b) => {
        data.push(b ? b.throughputPerHour : 0);
        metadata.push(b?.attributes);
      });
      return {
        id: status,
        label: status,
        labelItems: [status],
        legendName: status,
        data: data,
        // scale: 'mb',
        metadata: metadata,
        value: (self: uPlot, x: number) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(x) + '/h',
        stroke: color,
        width: 2,
        fill: (self: uPlot, seriesIdx: number) => this._uPlotUtils.gradientFill(self, color, [0, 0.6]),
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
        yAxisUnit: ' / h',
      },
      axes: [
        {
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'y',
          values: (u: unknown, vals: number[]) =>
            vals.map((v) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v) + '/h'),
        },
      ],
    };
  }
}
