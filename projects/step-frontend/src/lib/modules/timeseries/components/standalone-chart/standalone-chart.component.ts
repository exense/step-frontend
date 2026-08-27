import { Component, computed, EventEmitter, Output, inject, input, signal } from '@angular/core';
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
  ChartSkeletonComponent,
  MetricAggregation,
  TimeRange,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { catchError, defer, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { StandaloneChartConfig } from './standalone-chart-config';
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

  @Output() zoomReset = new EventEmitter<void>();
  @Output() zoomChange = new EventEmitter<TimeRange>();

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
    const request = this._timeSeriesChartUtils.createRequest({
      range,
      metricKey: this.metricKey(),
      oqlFilter: this.composeRequestFilter(),
      groupDimensions: this.grouping(),
      primaryAggregation: this.createAggregation(this.aggregation()),
      resolution: this.config().resolution,
      percentiles: this.aggregation() === ChartAggregation.PERCENTILE ? [80, 90, 99] : undefined,
    });
    const primaryAggregation = this.createAggregation(this.aggregation());
    const secondaryAxes = this.config().showZAxes
      ? {
          aggregation: this.createAggregation(ChartAggregation.RATE),
          displayType: 'BAR_CHART' as const,
          unit: '',
          colorizationType: 'STROKE' as const,
        }
      : undefined;
    return this._timeSeriesService.fetchBucketsWithFallback(request).pipe(
      switchMap((response) =>
        this._timeSeriesChartUtils
          .createChartSettings({
            response,
            request,
            metricKey: this.metricKey(),
            metricDisplayName: this.metricKey(),
            primaryAxes: {
              aggregation: primaryAggregation,
              displayType: 'LINE',
              unit: this.config().primaryAxesUnit ?? '',
              colorizationType: this.config().colorizationType ?? 'STROKE',
            },
            secondaryAxes,
            groupDimensions: this.grouping(),
            colorsPool: this.colorsPool(),
            title: this.config().title ?? '',
            showTooltip: this.config().showTooltip,
            showLegend: this.config().showLegend,
            showYAxes: this.config().showYAxes ?? true,
            showTimeAxes: this.config().showTimeAxes,
            showCursor: this.config().showCursor,
            zoomEnabled: this.config().zoomEnabled,
            secondaryAxesLabel: this.config().tooltipYAxesUnit,
            includeSecondaryMetadata: false,
            nullMeansZero: true,
            seriesMin: 50,
            seriesPxAlign: 1,
          })
          .pipe(
            tap((settings) => (this.chartSettings = settings)),
            map(() => response),
          ),
      ),
    );
  }

  private createAggregation(type: ChartAggregation): MetricAggregation {
    const params: Record<string, string | number> = {};
    if (type === ChartAggregation.RATE) {
      params[TimeSeriesConfig.RATE_UNIT_PARAM] = 'h';
    }
    if (type === ChartAggregation.PERCENTILE) {
      params[TimeSeriesConfig.PCL_VALUE_PARAM] = this.pclValue();
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
