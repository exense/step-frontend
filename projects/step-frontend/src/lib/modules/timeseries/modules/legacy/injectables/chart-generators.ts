import { TsChartType } from '../types/ts-chart-type';
import { ThreadGroupChartGenerator } from './thread-group-chart-generator';
import { ByStatusChartGenerator } from './by-status-chart-generator';
import { FetchBucketsRequest, TimeSeriesAPIResponse } from '@exense/step-core';
import { TimeSeriesUtils, TimeSeriesConfig, UPlotUtilsService, TimeseriesColorsPool } from '../../_common';
import { TSChartSettings } from '../../chart';
import { inject, Injectable } from '@angular/core';

declare const uPlot: any;

@Injectable({
  providedIn: 'root',
})
export class ChartGenerators {
  private _uPlotUtils = inject(UPlotUtilsService);
  private _byStatusChartGenerator = inject(ByStatusChartGenerator);
  private _threadGroupChartGenerator = inject(ThreadGroupChartGenerator);

  public static readonly barsFunction = uPlot.paths.bars; // this is a function from uplot which allows to draw bars instead of straight lines

  generateChart(
    type: TsChartType,
    request: FetchBucketsRequest,
    response: TimeSeriesAPIResponse,
    colorsPool?: TimeseriesColorsPool,
  ): TSChartSettings {
    switch (type) {
      case TsChartType.OVERVIEW:
        return this.createSummaryChartSettings(request, response);
      case TsChartType.BY_STATUS:
        return this._byStatusChartGenerator.createChart(request, response, colorsPool);
      case TsChartType.THREAD_GROUP:
        return this._threadGroupChartGenerator.createChart(request, response, colorsPool!);
      case TsChartType.RESPONSE_TIME:
      case TsChartType.THROUGHPUT:
        throw 'Not implemented exception';
    }
  }

  createSummaryChartSettings(request: FetchBucketsRequest, response: TimeSeriesAPIResponse): TSChartSettings {
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
          id: 'count',
          scale: 'total',
          legendName: 'Hits/h',
          label: 'Hits/h',
          labelItems: ['Hits/h'],
          data: countValues,
          value: (x: unknown, v: number) => Math.trunc(v),
          fill: (self: uPlot) =>
            this._uPlotUtils.multiColorsGradientFill(self, [
              { offset: 0, color: TimeSeriesConfig.OVERVIEW_COLORS[0] },
              { offset: 1, color: TimeSeriesConfig.OVERVIEW_COLORS[1] },
            ]),
          paths: ChartGenerators.barsFunction({ size: [0.5, 100], radius: 0.2 }),
          points: { show: false },
          show: true,
        },
        {
          id: 'avg',
          scale: 'y',
          label: 'Response Time',
          labelItems: ['Response Time'],
          data: avgValues,
          metadata: metadata,
          value: (x: unknown, v: number) => Math.trunc(v) + ' ms',
          width: 2,
          stroke: '#f79009',
          legendName: 'Average Response Time',
          show: true,
          points: {
            fill: '#f79009',
          },
        },
      ],
      axes: [
        {
          scale: 'y',
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          values: (u: unknown, vals: number[]) => vals.map((v) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.time(v)),
        },
        {
          side: 1,
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'z',
          values: (u: unknown, vals: number[]) =>
            vals.map((v) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v) + '/h'),
          grid: { show: false },
        },
      ],
      autoResize: true,
      truncated: response.truncated,
    };
  }
}
