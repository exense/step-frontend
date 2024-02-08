import { FetchBucketsRequest, TimeSeriesAPIResponse } from '@exense/step-core';
import { TimeSeriesUtils, TimeSeriesConfig, UPlotUtilsService, TimeseriesColorsPool } from '../../_common';
import { TSChartSeries, TSChartSettings } from '../../chart';
import { inject, Injectable } from '@angular/core';

declare const uPlot: any;

@Injectable({
  providedIn: 'root',
})
export class ThreadGroupChartGenerator {
  private _uplotUtils = inject(UPlotUtilsService);

  readonly DIMENSION_KEY = 'name';

  private readonly stepped = uPlot.paths.stepped; // this is a function from uplot wich allows to draw 'stepped' or 'stairs like' lines

  createChart(
    request: FetchBucketsRequest,
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
        value: (x: unknown, v: number) => Math.trunc(v),
        stroke: useRandomColors ? colorsPool.getColor(seriesKey) : '#024981',
        width: 2,
        paths: this.stepped({ align: 1 }),
        points: { show: false },
      } as TSChartSeries;
    });
    return {
      title: 'Thread Groups (Concurrency)',
      xValues: timeLabels,
      cursor: {
        dataIdx: this._uplotUtils.closestNotEmptyPointFunction,
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
          value: (x: unknown, v: number) => Math.trunc(v),
          fill: (self: uPlot) => this._uplotUtils.gradientFill(self, TimeSeriesConfig.TOTAL_BARS_COLOR),
          paths: this.stepped({ align: 1 }),
          points: { show: false },
        },
        ...dynamicSeries,
      ],
      axes: [
        {
          scale: 'y',
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          values: (u: unknown, vals) => vals.map((v) => (v === Math.floor(v) ? v : null)),
        },
        {
          side: 1,
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'total',
          values: (u: unknown, vals: number[]) => vals.map((v) => (v === Math.floor(v) ? v : null)),
          grid: { show: false },
        },
      ],
    };
  }
}
