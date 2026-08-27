import { Component, computed, EventEmitter, Output, inject, input, signal, output } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  TimeseriesColorsPool,
  TimeSeriesChartUtilsService,
  TimeSeriesConfig,
} from '../../modules/_common';
import { TimeSeriesChartComponent, TSChartSettings } from '../../modules/chart';
import {
  AxesSettings,
  ChartSkeletonComponent,
  MetricAggregation,
  TimeRange,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { catchError, defer, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { StandaloneChartAxesConfig, StandaloneChartConfig } from './standalone-chart-config';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';

type TimeRangeWithManualChange = TimeRange & { isManualChange?: boolean };

@Component({
  selector: 'step-standalone-dashlet',
  templateUrl: './standalone-chart.component.html',
  styleUrls: ['./standalone-chart.component.scss'],
  imports: [ChartSkeletonComponent, TimeSeriesChartComponent],
})
export class StandaloneChartComponent {
  readonly metricKey = input.required<string>();
  readonly timeRange = input.required<TimeRange>();
  readonly filters = input<FilterBarItem[]>([]);
  readonly aggregation = input<ChartAggregation>(ChartAggregation.AVG);
  readonly pclValue = input<number>(90);
  readonly grouping = input<string[]>([]);
  readonly config = input<StandaloneChartConfig>({});
  readonly colorsPool = input<TimeseriesColorsPool>(new TimeseriesColorsPool());

  readonly zoomReset = output();
  readonly zoomChange = output<TimeRange>();

  private readonly _timeSeriesService = inject(TimeSeriesService);
  private readonly _timeSeriesChartUtils = inject(TimeSeriesChartUtilsService);

  protected chartSettings?: TSChartSettings;
  protected readonly loading = signal(true);
  private previousLoadingKey?: string;

  private readonly _fetchParams = computed(() => ({
    timeRange: this.timeRange(),
    metricKey: this.metricKey(),
    filters: this.filters(),
    aggregation: this.aggregation(),
    pclValue: this.pclValue(),
    grouping: this.grouping(),
    config: this.config(),
    colorsPool: this.colorsPool(),
    loadingKey: JSON.stringify({
      metricKey: this.metricKey(),
      filters: this.filters(),
      aggregation: this.aggregation(),
      pclValue: this.pclValue(),
      grouping: this.grouping(),
      config: this.config(),
    }),
  }));

  private readonly _fetchSub = toObservable(this._fetchParams)
    .pipe(
      switchMap(({ timeRange, loadingKey }) => this.loadDataAndCreateChart(timeRange, loadingKey)),
      takeUntilDestroyed(),
    )
    .subscribe();

  private loadDataAndCreateChart(range: TimeRange, loadingKey?: string): Observable<TimeSeriesAPIResponse | undefined> {
    const rangeChange = (range as TimeRangeWithManualChange).isManualChange;

    return defer(() => {
      const shouldDisplayLoading =
        !this.chartSettings || rangeChange !== false || this.previousLoadingKey !== loadingKey;
      if (loadingKey !== undefined) {
        this.previousLoadingKey = loadingKey;
      }
      if (shouldDisplayLoading) {
        this.loading.set(true);
      }
      return defer(() => this.fetchDataAndCreateChart(range)).pipe(
        finalize(() => {
          if (shouldDisplayLoading) {
            this.loading.set(false);
          }
        }),
      );
    }).pipe(catchError(() => of(undefined)));
  }

  private fetchDataAndCreateChart(range: TimeRange): Observable<TimeSeriesAPIResponse> {
    if (range.from >= range.to) {
      throw new Error(`Invalid time range ${JSON.stringify(range)}`);
    }
    const config = this.config();
    const primaryAxes = this.resolvePrimaryAxes(config);
    const secondaryAxes = this.resolveSecondaryAxes(config);
    const useLegacyPercentiles =
      config.primaryAxes?.aggregation === undefined && config.primaryAxes?.pclValue === undefined;
    const request = this._timeSeriesChartUtils.createRequest({
      range,
      metricKey: this.metricKey(),
      oqlFilter: this.composeRequestFilter(),
      groupDimensions: this.grouping(),
      primaryAggregation: primaryAxes.aggregation,
      secondaryAggregation: secondaryAxes?.aggregation,
      resolution: config.resolution,
      percentiles:
        useLegacyPercentiles && this.aggregation() === ChartAggregation.PERCENTILE ? [80, 90, 99] : undefined,
    });
    return this._timeSeriesService.fetchBucketsWithFallback(request).pipe(
      switchMap((response) =>
        this._timeSeriesChartUtils
          .createChartSettings({
            response,
            request,
            metricKey: this.metricKey(),
            metricDisplayName: this.metricKey(),
            primaryAxes,
            secondaryAxes,
            groupDimensions: this.grouping(),
            colorsPool: this.colorsPool(),
            title: config.title ?? '',
            showTooltip: config.showTooltip,
            showLegend: config.showLegend,
            showYAxes: config.showYAxes ?? true,
            showTimeAxes: config.showTimeAxes,
            showCursor: config.showCursor,
            zoomEnabled: config.zoomEnabled,
            secondaryAxesLabel: config.tooltipYAxesUnit,
            includeSecondaryMetadata: false,
            nullMeansZero: config.nullMeansZero ?? true,
            seriesMin: 50,
            seriesPxAlign: 1,
            secondaryBarPathOptions: { size: [1, 100, 4], radius: 0.2, gap: 1 },
          })
          .pipe(
            tap((settings) => (this.chartSettings = settings)),
            map(() => response),
          ),
      ),
    );
  }

  private resolvePrimaryAxes(config: StandaloneChartConfig): AxesSettings {
    const axesConfig = config.primaryAxes;
    return {
      aggregation: this.resolveAggregation(axesConfig, this.aggregation(), this.pclValue()),
      displayType: axesConfig?.displayType ?? 'LINE',
      unit: axesConfig?.unit ?? config.primaryAxesUnit ?? '',
      renderingSettings: axesConfig?.renderingSettings,
      colorizationType: axesConfig?.colorizationType ?? config.colorizationType ?? 'STROKE',
    };
  }

  private resolveSecondaryAxes(config: StandaloneChartConfig): AxesSettings | undefined {
    if (config.secondaryAxes === null) {
      return undefined;
    }
    if (config.secondaryAxes === undefined && !config.showZAxes) {
      return undefined;
    }
    const axesConfig = config.secondaryAxes;
    return {
      aggregation: this.resolveAggregation(axesConfig, ChartAggregation.RATE),
      displayType: axesConfig?.displayType ?? 'BAR_CHART',
      unit: axesConfig?.unit ?? '',
      renderingSettings: axesConfig?.renderingSettings,
      colorizationType: axesConfig?.colorizationType ?? 'STROKE',
    };
  }

  private resolveAggregation(
    axesConfig: StandaloneChartAxesConfig | undefined,
    fallbackType: ChartAggregation,
    fallbackPclValue?: number,
  ): MetricAggregation {
    const aggregation = axesConfig?.aggregation ?? this.createAggregation(fallbackType, fallbackPclValue);
    const params: Record<string, string | number> = { ...aggregation.params };
    if (axesConfig?.rateUnit !== undefined) {
      params[TimeSeriesConfig.RATE_UNIT_PARAM] = axesConfig.rateUnit;
    }
    if (axesConfig?.pclValue !== undefined) {
      params[TimeSeriesConfig.PCL_VALUE_PARAM] = axesConfig.pclValue;
    }
    return { ...aggregation, params };
  }

  private createAggregation(type: ChartAggregation, pclValue?: number): MetricAggregation {
    const params: Record<string, string | number> = {};
    if (type === ChartAggregation.RATE) {
      params[TimeSeriesConfig.RATE_UNIT_PARAM] = 'h';
    }
    if (type === ChartAggregation.PERCENTILE) {
      params[TimeSeriesConfig.PCL_VALUE_PARAM] = pclValue ?? this.pclValue();
    }
    return { type, params };
  }

  protected handleZoomReset(): void {
    this.zoomReset.emit();
    this.loadDataAndCreateChart(this.timeRange()).subscribe();
  }

  protected handleZoomChange(range: TimeRange): void {
    this.zoomChange.emit(range);
    this.loadDataAndCreateChart(range).subscribe();
  }

  private composeRequestFilter(): string {
    const metricFilterItem = {
      attributeName: 'metricType',
      type: FilterBarItemType.FREE_TEXT,
      exactMatch: true,
      freeTextValues: [`"${this.metricKey()}"`],
      searchEntities: [],
    };
    const filters: FilterBarItem[] = [metricFilterItem, ...this.filters()];
    return FilterUtils.filtersToOQL(filters, 'attributes');
  }
}
