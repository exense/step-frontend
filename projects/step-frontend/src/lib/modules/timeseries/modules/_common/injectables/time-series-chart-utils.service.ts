import { inject, Injectable } from '@angular/core';
import {
  AppConfigContainerService,
  AxesSettings,
  BucketResponse,
  FetchBucketsRequest,
  MarkerType,
  MetricAggregation,
  MetricType,
  TimeRange,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { defaultIfEmpty, map, Observable, of } from 'rxjs';
import { Axis, Hooks } from 'uplot';
import type * as UPlot from 'uplot';
import { PipelineAggregationService } from './pipeline-aggregation.service';
import { ChartAggregation } from '../types/chart-aggregation';
import { TimeSeriesConfig } from '../types/time-series/time-series.config';
import { TimeSeriesUtils } from '../types/time-series/time-series-utils';
import { TimeseriesColorsPool } from '../types/time-series/timeseries-colors-pool';
import { TimeSeriesSyncGroup } from '../types/time-series/time-series-sync-group';
import { SeriesStroke } from '../types/time-series/series-stroke';
import { createStackedBarPaths } from '../types/time-series/stacked-bar-paths';
import { UPlotUtilsService } from './uplot-utils.service';
import { TSChartSeries, TSChartSettings } from '../../chart';

declare const uPlot: any;

export interface TimeSeriesChartRequestOptions {
  range: TimeRange;
  metricKey: string;
  oqlFilter: string;
  groupDimensions: string[];
  primaryAggregation: MetricAggregation;
  secondaryAggregation?: MetricAggregation;
  resolution?: number;
  numberOfBuckets?: number;
  collectExecutionIds?: boolean;
  percentiles?: number[];
}

export interface TimeSeriesSeriesDataOptions {
  nullMeansZero?: boolean;
  maxForwardFillBuckets?: number;
  nullIsEmpty?: boolean;
}

export interface TimeSeriesChartSettingsOptions {
  response: TimeSeriesAPIResponse;
  request: FetchBucketsRequest;
  metricKey: string;
  metricDisplayName: string;
  primaryAxes: AxesSettings;
  secondaryAxes?: AxesSettings;
  groupDimensions: string[];
  colorsPool: TimeseriesColorsPool;
  title: string;
  instrumentType?: MetricType['instrumentType'];
  samplingMode?: MetricType['samplingMode'];
  syncGroup?: TimeSeriesSyncGroup;
  hasExecutionAttribute?: boolean;
  showExecutionLinks?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showYAxes?: boolean;
  showTimeAxes?: boolean;
  showCursor?: boolean;
  zoomEnabled?: boolean;
  secondaryAxesLabel?: string;
  useDefaultColorWithoutGrouping?: boolean;
  includeSecondaryMetadata?: boolean;
  nullMeansZero?: boolean;
  seriesMin?: number;
  seriesPxAlign?: number;
  secondaryBarPathOptions?: UPlot.Series.BarsPathBuilderOpts;
  fetchLegendEntities?: (series: TSChartSeries[]) => Observable<unknown>;
}

export interface TimeSeriesResponseMetadata {
  higherResolutionUsed: boolean;
  collectionResolution: number;
  empty: boolean;
}

const RATE_UNIT_DIVIDERS: Record<string, number> = {
  s: 3600,
  m: 60,
  h: 1,
};

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesChartUtilsService {
  private readonly _pipelineAggregation = inject(PipelineAggregationService);
  private readonly _appConfig = inject(AppConfigContainerService);
  private readonly _timeSeriesService = inject(TimeSeriesService);
  private readonly _uPlotUtils = inject(UPlotUtilsService);

  private readonly samplingIntervalMs = this.resolveSamplingIntervalMs();
  private readonly stepped = uPlot.paths.stepped;
  private readonly bars = uPlot.paths.bars;

  createRequest(options: TimeSeriesChartRequestOptions): FetchBucketsRequest {
    const request: FetchBucketsRequest = {
      start: options.range.from,
      end: options.range.to,
      metricType: options.metricKey,
      groupDimensions: options.groupDimensions,
      oqlFilter: options.oqlFilter,
      percentiles:
        options.percentiles ?? this.getRequiredPercentiles(options.primaryAggregation, options.secondaryAggregation),
      ...this._pipelineAggregation.getFetchBucketsAggregationOptions(options.primaryAggregation),
    };

    if (options.resolution) {
      request.intervalSize = options.resolution;
    } else {
      request.numberOfBuckets = options.numberOfBuckets ?? 100;
    }

    if (options.collectExecutionIds) {
      request.collectAttributeKeys = [TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE];
      request.collectAttributesValuesLimit = 10;
    }

    return request;
  }

  createChartSettings(options: TimeSeriesChartSettingsOptions): Observable<TSChartSettings> {
    const { response, request, primaryAxes, secondaryAxes, groupDimensions, metricKey, metricDisplayName } = options;
    const primaryAggregation = primaryAxes.aggregation;
    const primaryTwoStageAggregation = this._pipelineAggregation.getTwoStageAggregation(primaryAggregation);
    const primaryDisplayAggregation = this._pipelineAggregation.getDisplayAggregation(primaryAggregation);
    const hasSteppedDisplay = primaryAxes.displayType === 'STEPPED';
    const hasSecondaryAxes = !!secondaryAxes;
    const hasExecutionLinks = !!options.hasExecutionAttribute && !hasSteppedDisplay;
    const secondaryAxesAggregation = secondaryAxes?.aggregation;
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const barPaths = this.bars({ size: [0.98, Infinity], align: 1, radius: 0.1 });
    const isGauge = options.instrumentType === 'gauge';
    const maxForwardFillBuckets = this.getMaxForwardFillBuckets(options.samplingMode, response.interval);
    const isRateOrCount =
      primaryDisplayAggregation.type === ChartAggregation.RATE ||
      primaryDisplayAggregation.type === ChartAggregation.COUNT;
    const useForwardFill = isGauge && !isRateOrCount;
    const nullMeansZero =
      options.nullMeansZero ??
      (isRateOrCount ||
        (!isGauge && (primaryAxes.displayType === 'BAR_CHART' || primaryAxes.displayType === 'STACKED_BAR')));
    const spanGaps = !nullMeansZero && !useForwardFill;
    const finalSecondaryAxesAggregation = primaryTwoStageAggregation ? primaryAggregation : secondaryAxesAggregation;
    const finalSecondaryDisplayAggregation = primaryTwoStageAggregation
      ? primaryDisplayAggregation
      : secondaryAxesAggregation;
    const isSecondaryRateOrCount =
      finalSecondaryDisplayAggregation?.type === ChartAggregation.RATE ||
      finalSecondaryDisplayAggregation?.type === ChartAggregation.COUNT;
    const useSecondaryForwardFill = isGauge && !isSecondaryRateOrCount;
    const secondaryAxesData: (number | undefined | null)[] = [];

    const series: TSChartSeries[] = response.matrix.map((seriesBuckets: BucketResponse[], index: number) => {
      const metadata: Record<string, any>[] = [];
      let labelItems = groupDimensions.map((field) => response.matrixKeys[index]?.[field] || undefined);
      if (groupDimensions.length === 0) {
        labelItems = [metricDisplayName];
      }
      const seriesKey = this.mergeLabelItems(labelItems, metricKey);
      const colorKey = this.composeColorKey(labelItems);
      const stroke = this.getSeriesStroke(colorKey, options);

      if (hasExecutionLinks || (hasSecondaryAxes && options.includeSecondaryMetadata !== false)) {
        seriesBuckets.forEach((bucket: BucketResponse) => metadata.push(bucket?.attributes));
      }
      if (hasSecondaryAxes) {
        this.accumulateSeriesData(
          secondaryAxesData,
          seriesBuckets,
          finalSecondaryAxesAggregation!,
          metricKey,
          response.interval,
          useSecondaryForwardFill ? maxForwardFillBuckets : undefined,
        );
      }

      const seriesData = this.createSeriesData(seriesBuckets, primaryAggregation, metricKey, response.interval, {
        nullMeansZero,
        maxForwardFillBuckets: useForwardFill ? maxForwardFillBuckets : undefined,
      });
      const chartSeries: TSChartSeries = {
        id: seriesKey,
        scale: 'y',
        labelItems,
        legendName: seriesKey,
        data: seriesData,
        metadata,
        spanGaps,
        value: (self, value) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(value),
        strokeConfig: stroke,
        points:
          spanGaps && primaryAxes.displayType === 'LINE'
            ? { show: true, size: 5, fill: stroke.color, width: 0 }
            : { show: false },
        show: options.syncGroup ? options.syncGroup.seriesShouldBeVisible(seriesKey) : true,
        min: options.seriesMin,
        pxAlign: options.seriesPxAlign,
      };
      this.applyStroke(chartSeries, stroke);
      if (primaryAxes.colorizationType === 'FILL' && primaryAxes.displayType !== 'STACKED_BAR') {
        chartSeries.fill = (self, seriesIndex: number) => this._uPlotUtils.gradientFill(self, stroke.color);
      }
      switch (primaryAxes.displayType) {
        case 'BAR_CHART':
          chartSeries.paths = barPaths;
          break;
        case 'STEPPED':
          chartSeries.paths = this.stepped({ align: 1 });
          break;
      }
      return chartSeries;
    });

    const edgeExtensionHook = this.createEdgeExtensionHook(series, spanGaps, primaryAxes.displayType);
    if (primaryAxes.displayType === 'STACKED_BAR') {
      this.prepareStackedSeries(series, hasSecondaryAxes);
    }

    const primaryUnit = primaryAxes.unit;
    const yAxesUnit = this.getUnitLabel(primaryDisplayAggregation, primaryUnit);
    const axes = this.createAxes(primaryDisplayAggregation, primaryUnit, options.showYAxes);

    if (secondaryAxes) {
      axes.push(this.createSecondaryAxis(finalSecondaryDisplayAggregation!));
      this.prepareSecondarySeries(
        series,
        secondaryAxesData,
        secondaryAxes,
        isSecondaryRateOrCount,
        useSecondaryForwardFill,
        maxForwardFillBuckets,
        options.secondaryBarPathOptions,
      );
    }

    const fetchExecutionsFn = this.createFetchExecutionsFunction(options, series, xLabels, hasSecondaryAxes);
    const legendEntities$ = options.fetchLegendEntities?.(series) ?? of(undefined);
    return legendEntities$.pipe(
      defaultIfEmpty(undefined),
      map(() => ({
        title: options.title,
        xAxesSettings: {
          values: xLabels,
          show: options.showTimeAxes,
        },
        series,
        tooltipOptions: {
          enabled: options.showTooltip ?? true,
          zAxisLabel: options.secondaryAxesLabel,
          yAxisUnit: yAxesUnit,
          useExecutionLinks: options.showExecutionLinks,
          fetchExecutionsFn,
        },
        showLegend: options.showLegend ?? true,
        showCursor: options.showCursor,
        zoomEnabled: options.zoomEnabled,
        axes,
        hooks: edgeExtensionHook,
        scales:
          primaryAxes.displayType === 'STACKED_BAR'
            ? { y: { range: (_: any, _min: number, max: number) => [0, max] as [number, number] } }
            : undefined,
        cursor: this.createCursor(primaryAxes, secondaryAxes),
        truncated: response.truncated,
      })),
    );
  }

  getResponseMetadata(response: TimeSeriesAPIResponse): TimeSeriesResponseMetadata {
    return {
      higherResolutionUsed: response.higherResolutionUsed,
      collectionResolution: response.collectionResolution,
      empty: response.matrix.length === 0,
    };
  }

  createSeriesData(
    buckets: BucketResponse[],
    aggregation: MetricAggregation,
    metricKey: string,
    bucketIntervalMs: number,
    options: TimeSeriesSeriesDataOptions = {},
  ): (number | undefined | null)[] {
    const result: (number | undefined | null)[] = [];
    let lastValue: number | undefined;
    let emptyBucketsCount = 0;

    buckets.forEach((bucket, index) => {
      let value = this.getBucketValue(bucket, aggregation, metricKey, bucketIntervalMs);
      if (value === undefined || (options.nullIsEmpty && value === null)) {
        emptyBucketsCount++;
        if (options.nullMeansZero) {
          value = 0;
        } else if (options.maxForwardFillBuckets !== undefined && lastValue !== undefined) {
          value = emptyBucketsCount <= options.maxForwardFillBuckets ? lastValue : 0;
        }
      } else {
        emptyBucketsCount = 0;
        if (value !== null) {
          lastValue = value;
        }
      }
      result[index] = value;
    });

    return result;
  }

  accumulateSeriesData(
    target: (number | undefined | null)[],
    buckets: BucketResponse[],
    aggregation: MetricAggregation,
    metricKey: string,
    bucketIntervalMs: number,
    maxForwardFillBuckets?: number,
  ): void {
    const values = this.createSeriesData(buckets, aggregation, metricKey, bucketIntervalMs, {
      maxForwardFillBuckets,
      nullIsEmpty: true,
    });
    values.forEach((value, index) => {
      if (target[index] == null) {
        target[index] = value;
      } else if (value != null) {
        target[index] = (target[index] as number) + value;
      }
    });
  }

  getBucketValue(
    bucket: BucketResponse,
    aggregation: MetricAggregation,
    metricKey: string,
    bucketIntervalMs: number,
  ): number | undefined | null {
    if (!bucket) {
      return undefined;
    }
    switch (aggregation.type) {
      case 'TWO_STAGE':
      case ChartAggregation.SUM:
        return bucket.sum;
      case ChartAggregation.AVG:
        return bucket.count > 0 ? bucket.sum / bucket.count : null;
      case ChartAggregation.MAX:
        return bucket.max;
      case ChartAggregation.MIN:
        return bucket.min;
      case ChartAggregation.COUNT:
        return bucket.count;
      case ChartAggregation.RATE:
        return this.getRateValue(bucket, aggregation, metricKey, bucketIntervalMs);
      case ChartAggregation.MEDIAN:
        return bucket.pclValues?.['50.0'];
      case ChartAggregation.PERCENTILE:
        return bucket.pclValues?.[this.getPercentileKey(aggregation.params?.[TimeSeriesConfig.PCL_VALUE_PARAM] ?? 90)];
      default:
        throw new Error(`Unhandled aggregation value: ${aggregation.type}`);
    }
  }

  getRequiredPercentiles(primaryAggregation: MetricAggregation, secondaryAggregation?: MetricAggregation): number[] {
    if (this._pipelineAggregation.getTwoStageAggregation(primaryAggregation)) {
      return [];
    }

    const result: number[] = [];
    [primaryAggregation, secondaryAggregation].forEach((aggregation) => {
      if (aggregation?.type === ChartAggregation.MEDIAN) {
        result.push(50);
      }
      if (aggregation?.type === ChartAggregation.PERCENTILE) {
        result.push(aggregation.params?.[TimeSeriesConfig.PCL_VALUE_PARAM] ?? 90);
      }
    });
    return result;
  }

  getAxesFormatFunction(aggregation: MetricAggregation, unit?: string): (value: number) => string {
    if (aggregation.type === ChartAggregation.RATE) {
      const rateUnit = this.getRateUnit(aggregation);
      return (value) => `${TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(value)}/${rateUnit}`;
    }
    if (!unit) {
      return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber;
    }
    switch (unit) {
      case '1':
      case '%':
        return (value) => `${value}${this.getUnitLabel(aggregation, unit)}`;
      case 'ms':
        return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.time;
      default:
        throw new Error(`Unit not handled: ${unit}`);
    }
  }

  getUnitLabel(aggregation: MetricAggregation, unit?: string): string {
    if (aggregation.type === ChartAggregation.RATE) {
      return `/ ${this.getRateUnit(aggregation)}`;
    }
    switch (unit) {
      case '%':
        return '%';
      case 'ms':
        return ' ms';
      default:
        return '';
    }
  }

  getRateUnit(aggregation: MetricAggregation): string {
    return aggregation.params?.[TimeSeriesConfig.RATE_UNIT_PARAM] ?? 's';
  }

  getMaxForwardFillBuckets(samplingMode: MetricType['samplingMode'] | undefined, bucketIntervalMs: number): number {
    if (samplingMode !== 'SAMPLED' || bucketIntervalMs <= 0) {
      return Number.MAX_SAFE_INTEGER;
    }
    const maxForwardFillMs = TimeSeriesConfig.FORWARD_FILL_MAX_SAMPLING_INTERVALS * this.samplingIntervalMs;
    return Math.floor(maxForwardFillMs / bucketIntervalMs);
  }

  composeColorKey(items: (string | undefined)[]): string {
    return items.map((item) => (item ?? '').trim().toLowerCase()).join('|');
  }

  mergeLabelItems(items: (string | undefined)[], fallback: string): string {
    if (items.length === 0) {
      return fallback;
    }
    return items.map((item) => item || TimeSeriesConfig.SERIES_LABEL_EMPTY).join(' | ');
  }

  private getSeriesStroke(colorKey: string, options: TimeSeriesChartSettingsOptions): SeriesStroke {
    if (options.useDefaultColorWithoutGrouping && options.groupDimensions.length === 0) {
      return { color: TimeSeriesConfig.SERIES_DEFAULT_COLOR, type: MarkerType.SQUARE };
    }
    const customColor = this.getCustomSeriesColor(colorKey, options.primaryAxes.renderingSettings?.seriesColors);
    return customColor ? { color: customColor, type: MarkerType.SQUARE } : options.colorsPool.getSeriesColor(colorKey);
  }

  private getCustomSeriesColor(colorKey: string, seriesColors?: Record<string, string>): string | undefined {
    const customColor = seriesColors?.[colorKey];
    if (customColor || !seriesColors) {
      return customColor;
    }
    const normalizedColorKey = colorKey.toLowerCase();
    const matchingKey = Object.keys(seriesColors).find((key) => key.toLowerCase() === normalizedColorKey);
    return matchingKey ? seriesColors[matchingKey] : undefined;
  }

  private applyStroke(series: TSChartSeries, stroke: SeriesStroke): void {
    switch (stroke.type) {
      case MarkerType.SQUARE:
        series.width = 1;
        break;
      case MarkerType.DASHED:
        series.dash = [10, 5];
        series.width = 1;
        break;
      case MarkerType.DOTS:
        series.width = 2;
        series.dash = [2, 2];
        break;
    }
  }

  private createEdgeExtensionHook(
    series: TSChartSeries[],
    spanGaps: boolean,
    displayType: AxesSettings['displayType'],
  ): Hooks.Arrays | undefined {
    if (!spanGaps || displayType !== 'LINE') {
      return undefined;
    }
    return {
      drawSeries: [
        (plot: any, seriesIndex: number) => {
          if (!plot.series[seriesIndex].show) return;
          const chartSeries = series[seriesIndex - 1];
          if (!chartSeries || chartSeries.scale !== 'y' || !chartSeries.spanGaps) return;
          const yData = plot.data[seriesIndex] as (number | null | undefined)[];
          let firstIndex = -1;
          let lastIndex = -1;
          for (let index = 0; index < yData.length; index++) {
            if (yData[index] != null) {
              if (firstIndex === -1) firstIndex = index;
              lastIndex = index;
            }
          }
          if (firstIndex === -1 || (firstIndex === 0 && lastIndex === yData.length - 1)) return;
          const xData = plot.data[0] as number[];
          const context = plot.ctx as CanvasRenderingContext2D;
          const pixelRatio = devicePixelRatio || 1;
          context.save();
          context.strokeStyle = chartSeries.strokeConfig!.color + '70';
          context.lineWidth = pixelRatio;
          context.setLineDash([4 * pixelRatio, 4 * pixelRatio]);
          if (firstIndex > 0) {
            const yPosition = plot.valToPos(yData[firstIndex], 'y', true);
            const xPosition = plot.valToPos(xData[firstIndex], 'x', true);
            context.beginPath();
            context.moveTo(plot.bbox.left, yPosition);
            context.lineTo(xPosition, yPosition);
            context.stroke();
          }
          if (lastIndex < yData.length - 1) {
            const yPosition = plot.valToPos(yData[lastIndex], 'y', true);
            const xPosition = plot.valToPos(xData[lastIndex], 'x', true);
            context.beginPath();
            context.moveTo(xPosition, yPosition);
            context.lineTo(plot.bbox.left + plot.bbox.width, yPosition);
            context.stroke();
          }
          context.restore();
        },
      ],
    };
  }

  private prepareStackedSeries(series: TSChartSeries[], hasSecondaryAxes: boolean): void {
    series.sort((first, second) => (first.id < second.id ? -1 : first.id > second.id ? 1 : 0));
    series.forEach((item) => (item.originalData = [...item.data]));
    series.forEach((item) => (item.data = item.data.map((value) => value ?? 0)));
    this.cumulateSeriesData(series);
    const skippedSeries = hasSecondaryAxes ? 1 : 0;
    const stackStartSeriesIndex = 1 + skippedSeries;
    const stackEndSeriesIndex = series.length + skippedSeries;
    series.forEach((item) => {
      item.paths = createStackedBarPaths({
        size: [0.85, Infinity],
        align: 1,
        radius: 0.1,
        stackStartSeriesIdx: stackStartSeriesIndex,
        stackEndSeriesIdx: stackEndSeriesIndex,
      });
      item.fill = item.strokeConfig!.color + 'cc';
      item.value = (self: any, value: number, seriesIndex: number, index: number) =>
        TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(
          this.calculateStackedValue(self, value, seriesIndex, index, skippedSeries),
        );
    });
  }

  private createAxes(primaryAggregation: MetricAggregation, primaryUnit: string, showYAxes?: boolean): Axis[] {
    return [
      {
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        scale: 'y',
        values: (plot, values) =>
          values.map((value: number) => this.getAxesFormatFunction(primaryAggregation, primaryUnit)(value)),
        show: showYAxes ?? true,
      },
    ];
  }

  private createSecondaryAxis(aggregation: MetricAggregation): Axis {
    return {
      scale: TimeSeriesConfig.SECONDARY_AXES_KEY,
      side: 1,
      size: TimeSeriesConfig.CHART_LEGEND_SIZE,
      values: (plot: unknown, values: number[]) =>
        values.map((value) => this.getAxesFormatFunction(aggregation)(value)),
      grid: { show: false },
    } as Axis;
  }

  private prepareSecondarySeries(
    series: TSChartSeries[],
    data: (number | undefined | null)[],
    axes: AxesSettings,
    isRateOrCount: boolean,
    useForwardFill: boolean,
    maxForwardFillBuckets: number,
    barPathOptions?: UPlot.Series.BarsPathBuilderOpts,
  ): void {
    const nullMeansZero = isRateOrCount || (!useForwardFill && axes.displayType !== 'LINE');
    if (useForwardFill) {
      let lastValue: number | undefined;
      let emptyBucketsCount = 0;
      data.forEach((value, index) => {
        if (value == null) {
          emptyBucketsCount++;
          if (lastValue !== undefined) {
            data[index] = emptyBucketsCount <= maxForwardFillBuckets ? lastValue : 0;
          }
        } else {
          emptyBucketsCount = 0;
          lastValue = value;
        }
      });
    } else if (nullMeansZero) {
      data.forEach((value, index) => {
        if (value == null) {
          data[index] = 0;
        }
      });
    }

    const secondarySeries: TSChartSeries = {
      scale: TimeSeriesConfig.SECONDARY_AXES_KEY,
      labelItems: ['Total'],
      id: 'total',
      strokeConfig: { color: '', type: MarkerType.SQUARE },
      data,
      spanGaps: !nullMeansZero && !useForwardFill,
      value: (plot, value: number) => `${Math.trunc(value)} total`,
      points: { show: false },
    };
    if (axes.displayType !== 'LINE') {
      secondarySeries.paths = this.bars(barPathOptions ?? { size: [0.98, Infinity], align: 1, radius: 0.1 });
      secondarySeries.fill = TimeSeriesConfig.TOTAL_BARS_COLOR;
    } else {
      secondarySeries.stroke = TimeSeriesConfig.TOTAL_BARS_COLOR;
      secondarySeries.fill = (plot: any) => this._uPlotUtils.gradientFill(plot, TimeSeriesConfig.TOTAL_BARS_COLOR);
    }
    series.unshift(secondarySeries);
  }

  private createFetchExecutionsFunction(
    options: TimeSeriesChartSettingsOptions,
    series: TSChartSeries[],
    xLabels: number[],
    hasSecondaryAxes: boolean,
  ): (index: number, seriesId: string) => Observable<string[]> {
    return (index: number, seriesId: string): Observable<string[]> => {
      if (!options.response.collectionIgnoredAttributes?.includes(TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE)) {
        return of([]);
      }
      const selectedSeriesIndex = series.findIndex((item) => item.id === seriesId);
      const offset = hasSecondaryAxes ? 1 : 0;
      if (selectedSeriesIndex < offset) {
        return of([]);
      }
      const selectedBucketAttributes = options.response.matrixKeys[selectedSeriesIndex - offset];
      if (!selectedBucketAttributes) {
        return of([]);
      }
      options.request.groupDimensions?.forEach((dimension) => {
        if (!selectedBucketAttributes[dimension]) {
          selectedBucketAttributes[dimension] = null;
        }
      });
      const isolateRequest: FetchBucketsRequest = {
        start: xLabels[index],
        end: xLabels[index] + options.response.interval,
        groupDimensions: [TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE],
        oqlFilter: options.request.oqlFilter,
        params: selectedBucketAttributes,
      };
      return this._timeSeriesService
        .fetchBuckets(isolateRequest)
        .pipe(
          map((response) =>
            response.matrixKeys.map((attributes) => attributes[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE]),
          ),
        );
    };
  }

  private createCursor(primaryAxes: AxesSettings, secondaryAxes?: AxesSettings): TSChartSettings['cursor'] {
    const usesBars =
      primaryAxes.displayType === 'BAR_CHART' ||
      primaryAxes.displayType === 'STACKED_BAR' ||
      (!!secondaryAxes && secondaryAxes.displayType !== 'LINE');
    if (!usesBars) {
      return undefined;
    }
    return {
      dataIdx: (plot: any, seriesIndex: number, hoveredIndex: number, cursorValue: number) => {
        const xData = plot.data[0] as number[];
        let index = hoveredIndex;
        while (index > 0 && xData[index] > cursorValue) index--;
        while (index < xData.length - 1 && xData[index + 1] <= cursorValue) index++;
        return index;
      },
    };
  }

  private cumulateSeriesData(series: TSChartSeries[]): void {
    series.forEach((item, seriesIndex) => {
      if (seriesIndex === 0) return;
      item.data.forEach((value, valueIndex) => {
        item.data[valueIndex] = (series[seriesIndex - 1].data[valueIndex] as number) + (value as number);
      });
    });
  }

  private calculateStackedValue(
    plot: any,
    currentValue: number,
    seriesIndex: number,
    valueIndex: number,
    skippedSeries: number,
  ): number {
    if (seriesIndex > 1 + skippedSeries) {
      return currentValue - (plot.data[seriesIndex - 1][valueIndex] || 0);
    }
    return currentValue;
  }

  private getRateValue(
    bucket: BucketResponse,
    aggregation: MetricAggregation,
    metricKey: string,
    bucketIntervalMs: number,
  ): number {
    const divider = RATE_UNIT_DIVIDERS[this.getRateUnit(aggregation)] ?? 1;
    if (metricKey === 'counter') {
      const intervalHours = bucketIntervalMs / 3_600_000;
      return intervalHours > 0 ? bucket.sum / intervalHours / divider : 0;
    }
    return bucket.throughputPerHour / divider;
  }

  private getPercentileKey(value: number | string): string {
    const numericValue = Number(value);
    return Number.isInteger(numericValue) ? numericValue.toFixed(1) : String(value);
  }

  private resolveSamplingIntervalMs(): number {
    const rawValue = this._appConfig.conf?.miscParams?.[TimeSeriesConfig.PARAM_KEY_METRICS_SAMPLING_INTERVAL_MS];
    const samplingInterval = parseInt(rawValue ?? '', 10);
    return samplingInterval > 0 ? samplingInterval : TimeSeriesConfig.DEFAULT_METRICS_SAMPLING_INTERVAL_MS;
  }
}
