import { KeyValue } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, BucketAttributes, Execution, TimeSeriesAPIResponse, TimeSeriesService } from '@exense/step-core';
import { forkJoin, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { TSChartSeries, TSChartSettings } from '../chart/model/ts-chart-settings';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TimeSeriesChartComponent } from '../chart/time-series-chart.component';
import { KeywordSelection, TimeSeriesKeywordsContext } from '../pages/execution-page/time-series-keywords.context';
import { FindBucketsRequest } from '../find-buckets-request';
import { TSRangerComponent } from '../ranger/ts-ranger.component';
import { TimeSeriesContext } from '../time-series-context';
import { TimeSeriesUtils } from '../time-series-utils';
import { RefreshInterval, TimeSeriesConfig } from '../time-series.config';
import { UPlotUtils } from '../uplot/uPlot.utils';
import { FindBucketsRequestBuilder } from '../util/find-buckets-request-builder';
import { ChartGenerators } from './chart-generators/chart-generators';
import { PerformanceViewSettings } from './model/performance-view-settings';
import { ThroughputMetric } from './model/throughput-metric';
import { TsChartType } from './model/ts-chart-type';
import { UpdatePerformanceViewRequest } from './model/update-performance-view-request';
import { TimeseriesTableComponent } from './table/timeseries-table.component';
import { PerformanceViewTimeSelectionComponent } from './time-selection/performance-view-time-selection.component';
import { TsFilteringMode } from '../model/ts-filtering-mode';
import { ChartsViewConfig } from './charts-view.config';
import { ResponseTimeMetric } from './model/response-time-metric';

declare const uPlot: any;

/**
 * This component is responsible for fetching the actual charts data from the backend
 */
@Component({
  selector: 'step-charts-view',
  templateUrl: './charts-view.component.html',
  styleUrls: ['./charts-view.component.scss'],
})
export class ChartsViewComponent implements OnInit, OnDestroy {
  private CHART_LEGEND_SIZE = 65;

  rangerSettings: TSChartSettings | undefined;

  // key: TsChartType. here we keep all chart settings (by TsChartType
  currentChartsSettings: { [key: string]: TSChartSettings } = {};
  compareChartsSettings: { [key: string]: TSChartSettings } = {};

  @ViewChild('ranger') ranger!: TSRangerComponent;

  @ViewChild('summaryChart') summaryChart!: TimeSeriesChartComponent;
  @ViewChild('summaryCompareChart') summaryCompareChart: TimeSeriesChartComponent | undefined;

  @ViewChild('byStatusChart') byStatusChart!: TimeSeriesChartComponent;
  @ViewChild('byStatusCompareChart') byStatusCompareChart!: TimeSeriesChartComponent | undefined;

  @ViewChild('responseTimeChart') responseTimeChart!: TimeSeriesChartComponent;
  @ViewChild('responseTimeCompareChart') responseTimeCompareChart!: TimeSeriesChartComponent | undefined;

  @ViewChild('throughputChart') throughputChart!: TimeSeriesChartComponent;
  @ViewChild('throughputCompareChart') throughputCompareChart!: TimeSeriesChartComponent;

  @ViewChild('threadGroupChart') threadGroupChart!: TimeSeriesChartComponent;
  @ViewChild('threadGroupCompareChart') threadGroupCompareChart!: TimeSeriesChartComponent | undefined;

  @ViewChild('tableChart') tableChart!: TimeseriesTableComponent;

  @Input() context!: TimeSeriesContext;
  @Input() settings!: PerformanceViewSettings;
  @Input() timeSelection?: PerformanceViewTimeSelectionComponent;
  @Input() includeThreadGroupChart = true;

  @Output() onInitializationComplete: EventEmitter<void> = new EventEmitter<void>();
  @Output() onUpdateComplete: EventEmitter<void> = new EventEmitter<void>();

  chartsAreLoading = false;
  compareChartsAreLoading = false;

  baseKeywords: { [key: string]: KeywordSelection } = {};
  baseKeywordSearchValue: string = '';
  allBaseSeriesChecked: boolean = true;

  compareKeywords: { [key: string]: KeywordSelection } = {};
  compareKeywordSearchValue: string = '';
  allCompareSeriesChecked: boolean = true;

  byKeywordsChartResponseCache?: TimeSeriesAPIResponse; // for caching
  byKeywordsCompareChartResponseCache?: TimeSeriesAPIResponse; // for caching

  // findRequest!: FindBucketsRequest;
  findRequestBuilder: FindBucketsRequestBuilder = new FindBucketsRequestBuilder();
  compareRequestBuilder: FindBucketsRequestBuilder = new FindBucketsRequestBuilder();
  groupDimensions: string[] = [];

  execution: Execution | undefined;
  executionStart: number = 0;
  executionInProgress = false;
  refreshEnabled = false;

  // this is just for running executions
  refreshIntervals: RefreshInterval[] = TimeSeriesConfig.AUTO_REFRESH_INTERVALS;
  selectedRefreshInterval: RefreshInterval = this.refreshIntervals[0];

  terminator$ = new Subject<void>();
  compareTerminator$ = new Subject<void>();
  updateBaseChartsTerminator$ = new Subject<void>();
  updateCompareChartsTerminator$ = new Subject<void>();
  intervalShouldBeCanceled = false;

  private keywordsService!: TimeSeriesKeywordsContext;

  responseTimeMetrics = ChartsViewConfig.responseTimeMetrics;
  selectedResponseTimeMetric = this.responseTimeMetrics[0];
  selectedCompareResponseTimeMetric = this.responseTimeMetrics[0];

  throughputMetrics = ChartsViewConfig.throughputMetrics;
  selectedThroughputMetric = this.throughputMetrics[0];
  selectedCompareThroughputMetric = this.throughputMetrics[0];

  initializationTasks: Observable<any>[] = [];
  updateTasks: Observable<any>[] = [];

  compareModeEnabled: boolean = false;
  compareModeContext: TimeSeriesContext | undefined;

  valueAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.key.localeCompare(b.key);
  };

  private timeSeriesService = inject(TimeSeriesService);

  onAllSeriesCheckboxClick(event: any) {
    this.keywordsService.toggleSelectAll();
  }

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Settings input is not specified!');
    }
    if (!this.context) {
      throw new Error('Context not provided!');
    }
    this.findRequestBuilder = this.prepareFindRequestBuilder(this.settings);
    this.initContext();
    this.subscribeForKeywordsChange();
    this.subscribeForTimeRangeChange();

    this.context.compareModeChange$.subscribe((settings) => {
      if (settings.enabled) {
        this.enableCompareMode(settings.context!);
      } else {
        this.disableCompareMode();
      }
    });

    this.createAllBaseCharts();
  }

  private subscribeForKeywordsChange(compareCharts = false): void {
    const terminator = compareCharts ? this.compareTerminator$ : this.terminator$;
    this.keywordsService
      .onAllSelectionChanged()
      .pipe(takeUntil(terminator))
      .subscribe((selected) => {
        if (compareCharts) {
          this.allCompareSeriesChecked = selected;
        } else {
          this.allBaseSeriesChecked = selected;
        }
      });
    this.keywordsService
      .onKeywordToggled()
      .pipe(takeUntil(terminator))
      .subscribe((selection) => {
        if (compareCharts) {
          this.throughputCompareChart?.setSeriesVisibility(selection.id, selection.isSelected);
          this.responseTimeCompareChart?.setSeriesVisibility(selection.id, selection.isSelected);
          this.compareKeywords[selection.id] = selection;
        } else {
          this.throughputChart.setSeriesVisibility(selection.id, selection.isSelected);
          this.responseTimeChart.setSeriesVisibility(selection.id, selection.isSelected);
          this.baseKeywords[selection.id] = selection;
        }
      });
    this.keywordsService
      .onKeywordsUpdated()
      .pipe(takeUntil(terminator))
      .subscribe((keywords) => {
        if (compareCharts) {
          this.compareKeywords = keywords;
        } else {
          this.baseKeywords = keywords;
        }
      });
  }

  private subscribeForTimeRangeChange(compareCharts = false) {
    const context = this.getContext(compareCharts);
    context
      .onTimeSelectionChange()
      .pipe(
        switchMap((newRange) =>
          compareCharts ? this.handleCompareSelectionChange(newRange) : this.handleSelectionChange(newRange)
        ),
        takeUntil(compareCharts ? this.compareTerminator$ : this.terminator$)
      )
      .subscribe();
  }

  /**
   * This method will use the most recent context settings (like range, selection, filters, grouping)
   * @param request
   */
  updateBaseCharts(request: UpdatePerformanceViewRequest): Observable<any> {
    this.updateBaseChartsTerminator$.next(); // to keep executions synchronous
    // let's assume the complete interval and selections are set.
    if (!this.context.inProgress$.getValue()) {
      this.context.setInProgress(true);
    }
    const updates$ = [];
    if (request.showLoadingBar) {
      this.chartsAreLoading = true;
    }
    if (request.updateRanger) {
      // updates$.push(...(this.timeSelection ? [this.timeSelection.refreshRanger()] : []));
    }
    if (request.updateCharts) {
      updates$.push(this.refreshAllCharts());
    }
    return forkJoin(updates$).pipe(
      takeUntil(this.updateBaseChartsTerminator$),
      tap(() => {
        this.chartsAreLoading = false;
        this.context.setInProgress(false);
      })
    );
  }

  /**
   * This method will use the most recent context settings (like range, selection, filters, grouping)
   * @param request
   */
  updateCompareCharts(request: UpdatePerformanceViewRequest): Observable<any> {
    if (!this.compareModeEnabled) {
      return of(undefined);
    }
    this.updateBaseChartsTerminator$.next(); // to keep executions synchronous
    // let's assume the complete interval and selections are set.
    if (!this.compareModeContext?.inProgress$.getValue()) this.compareModeContext?.setInProgress(true);
    const updates$ = [];
    if (request.showLoadingBar) {
      this.compareChartsAreLoading = true;
    }
    if (request.updateRanger) {
      // updates$.push(...(this.timeSelection ? [this.timeSelection.refreshRanger()] : []));
    }
    if (request.updateCharts) {
      updates$.push(this.refreshAllCompareCharts());
    }
    return forkJoin(updates$).pipe(
      takeUntil(this.updateCompareChartsTerminator$),
      tap(() => {
        this.compareChartsAreLoading = false;
        this.compareModeContext?.setInProgress(false);
      })
    );
  }

  handleSelectionChange(selection: TSTimeRange): Observable<any> {
    if (TimeSeriesUtils.intervalsEqual(this.findRequestBuilder.getRange(), selection)) {
      // nothing happened
      return of(undefined);
    }
    this.getAllCharts().forEach((chart) => {
      chart?.setBlur(true);
    });
    this.findRequestBuilder.withRange(selection);
    return this.refreshAllCharts();
  }

  handleCompareSelectionChange(selection: TSTimeRange): Observable<any> {
    if (TimeSeriesUtils.intervalsEqual(this.compareRequestBuilder.getRange(), selection)) {
      // nothing happened
      return of(undefined);
    }
    this.getAllCompareCharts().forEach((chart) => {
      chart?.setBlur(true);
    });
    this.compareRequestBuilder.withRange(selection);
    return this.refreshAllCompareCharts();
  }

  private initContext() {
    this.keywordsService = this.context.keywordsContext;
    this.context.onCompareModeChange().subscribe(({ enabled, context }) => {
      this.compareModeEnabled = enabled;
      this.compareModeContext = context;
    });
  }

  private prepareFindRequestBuilder(settings: PerformanceViewSettings): FindBucketsRequestBuilder {
    return new FindBucketsRequestBuilder()
      .withRange(settings.timeRange)
      .addAttribute(TimeSeriesConfig.METRIC_TYPE_KEY, TimeSeriesConfig.METRIC_TYPE_RESPONSE_TIME)
      .withFilteringSettings(this.context.getFilteringSettings())
      .withNumberOfBuckets(TimeSeriesConfig.MAX_BUCKETS_IN_CHART);
  }

  private createAllBaseCharts() {
    const charts$ = [
      this.createSummaryChart(),
      this.createByStatusChart(),
      this.createByKeywordsCharts(),
      this.createTableChart(),
    ];
    if (this.includeThreadGroupChart) {
      charts$.push(this.createThreadGroupsChart());
    }

    forkJoin(charts$)
      .pipe(takeUntil(this.terminator$))
      .subscribe((allCompleted) => this.onInitializationComplete.emit());
  }

  createAllCompareCharts(context: TimeSeriesContext) {
    const charts$ = [
      this.createSummaryChart(true),
      this.createByStatusChart(true),
      this.createByKeywordsCharts(true),
      this.createTableChart(true),
    ];
    if (this.includeThreadGroupChart) {
      charts$.push(this.createThreadGroupsChart(true));
    }

    forkJoin(charts$).pipe(takeUntil(this.terminator$)).subscribe();
  }

  private refreshAllCharts(): Observable<unknown> {
    this.findRequestBuilder = this.prepareFindRequestBuilder(this.settings); // we don't want to lose active filters

    const timeSelection = this.context.getSelectedTimeRange();
    this.findRequestBuilder.withRange(timeSelection);

    const charts$ = [
      this.createSummaryChart(),
      this.createByStatusChart(),
      this.createByKeywordsCharts(),
      this.createTableChart(),
    ];
    if (this.includeThreadGroupChart) {
      charts$.push(this.createThreadGroupsChart());
    }

    return forkJoin(charts$);
  }

  private refreshAllCompareCharts(): Observable<unknown> {
    this.compareRequestBuilder = this.createCompareRequest(this.compareModeContext!); // we don't want to lose active filters
    const timeSelection = this.compareModeContext!.getSelectedTimeRange();
    this.compareRequestBuilder.withRange(timeSelection);

    const charts$ = [
      this.createSummaryChart(true),
      this.createByStatusChart(true),
      this.createByKeywordsCharts(true),
      this.updateTableCompareData(),
    ];
    if (this.includeThreadGroupChart) {
      // charts$.push(this.createThreadGroupsChart());
    }

    return forkJoin(charts$);
  }

  onKeywordToggle(keyword: string, event: any) {
    this.keywordsService.toggleKeyword(keyword);
  }

  onChartsZoomReset() {
    this.context.resetZoom();
  }

  onCompareChartsZoomReset() {
    this.compareModeContext?.resetZoom();
  }

  createThreadGroupsChart(compareChart = false): Observable<TimeSeriesAPIResponse> {
    const context = this.getContext(compareChart);
    const filteringSettings = context.getFilteringSettings();
    if (filteringSettings.mode === TsFilteringMode.OQL && this.settings.disableThreadGroupOnOqlMode) {
      const threadGroupChart = compareChart
        ? this.getCompareChart(TsChartType.THREAD_GROUP)
        : this.getChart(TsChartType.THREAD_GROUP);
      threadGroupChart?.setAsUnavailable();
      let emptyResponse = { start: 0, end: 0, interval: 0, matrix: [], matrixKeys: [] };
      return of(emptyResponse);
    }

    const requestBuilder = compareChart ? this.compareRequestBuilder : this.findRequestBuilder;
    const request = requestBuilder
      .clone()
      .addAttribute(TimeSeriesConfig.METRIC_TYPE_KEY, TimeSeriesConfig.METRIC_TYPE_SAMPLER)
      .withGroupDimensions(['name'])
      .withFilteringSettings(filteringSettings)
      .withFilterAttributesMask(TimeSeriesConfig.THREAD_GROUP_FILTER_FIELDS)
      .withSkipCustomOQL(true)
      .build();
    return this.timeSeriesService
      .getBuckets(request)
      .pipe(tap((response) => this.createChart(TsChartType.THREAD_GROUP, request, response, compareChart)));
  }

  createChart(type: TsChartType, request: FindBucketsRequest, response: TimeSeriesAPIResponse, compareChart = false) {
    // all charts should be created and grouped via this principle in the end.
    const existingChart = compareChart ? this.getCompareChart(type) : this.getChart(type);
    if (response.matrixKeys.length === 0 && existingChart) {
      // empty data
      existingChart.clear();
      return;
    }
    const newChart = ChartGenerators.generateChart(type, request, response, this.context.keywordsContext.colorsPool);
    if (compareChart) {
      this.compareChartsSettings[type] = newChart;
    } else {
      this.currentChartsSettings[type] = newChart;
    }
  }

  /**
   * This method is used for both creating or updating the chart
   */
  createSummaryChart(compareChart = false): Observable<TimeSeriesAPIResponse> {
    const requestBuilder = this.getRequestBuilder(compareChart);
    const request = requestBuilder.build();
    return this.timeSeriesService
      .getBuckets(request)
      .pipe(tap((response) => this.createChart(TsChartType.OVERVIEW, request, response, compareChart)));
  }

  getChart(chartType: TsChartType): TimeSeriesChartComponent {
    switch (chartType) {
      case TsChartType.OVERVIEW:
        return this.summaryChart;
      case TsChartType.BY_STATUS:
        return this.byStatusChart;
      case TsChartType.RESPONSE_TIME:
        return this.responseTimeChart;
      case TsChartType.THROUGHPUT:
        return this.throughputChart;
      case TsChartType.THREAD_GROUP:
        return this.threadGroupChart;
      default:
        throw new Error('Not Implemented');
    }
  }

  getCompareChart(chartType: TsChartType): TimeSeriesChartComponent | undefined {
    switch (chartType) {
      case TsChartType.OVERVIEW:
        return this.summaryCompareChart;
      case TsChartType.BY_STATUS:
        return this.byStatusCompareChart;
      case TsChartType.RESPONSE_TIME:
        return this.responseTimeCompareChart;
      case TsChartType.THROUGHPUT:
        return this.throughputCompareChart;
      case TsChartType.THREAD_GROUP:
        return this.threadGroupCompareChart;
      default:
        throw new Error('Not Implemented');
    }
  }

  createByStatusChart(compareChart = false): Observable<TimeSeriesAPIResponse> {
    const request = this.getRequestBuilder(compareChart)
      .clone()
      .withGroupDimensions([TimeSeriesConfig.STATUS_ATTRIBUTE])
      .build();
    return this.timeSeriesService
      .getBuckets(request)
      .pipe(tap((response) => this.createChart(TsChartType.BY_STATUS, request, response, compareChart)));
  }

  private getRequestBuilder(compareMode = false): FindBucketsRequestBuilder {
    return compareMode ? this.compareRequestBuilder : this.findRequestBuilder;
  }

  createTableChart(compareChart = false): Observable<TimeSeriesAPIResponse> {
    const context = this.getContext(compareChart);
    const requestBuilder = compareChart ? this.compareRequestBuilder : this.findRequestBuilder;
    const findRequest = this.getTableRequest(requestBuilder, context);

    return this.timeSeriesService.getBuckets(findRequest).pipe(
      tap((response) => {
        if (compareChart) {
          this.tableChart.enableCompareMode(response, context);
        } else {
          this.tableChart.updateData(response);
        }
      })
    );
  }

  enableCompareMode(context: TimeSeriesContext): void {
    this.compareModeContext = context;
    this.compareRequestBuilder = this.createCompareRequest(context);
    this.subscribeForTimeRangeChange(true);
    this.subscribeForKeywordsChange(true);
    this.createAllCompareCharts(context);
  }

  private createCompareRequest(context: TimeSeriesContext): FindBucketsRequestBuilder {
    return new FindBucketsRequestBuilder()
      .withRange(context.getFullTimeRange())
      .addAttribute(TimeSeriesConfig.METRIC_TYPE_KEY, TimeSeriesConfig.METRIC_TYPE_RESPONSE_TIME)
      .withFilteringSettings(context.getFilteringSettings())
      .withNumberOfBuckets(TimeSeriesConfig.MAX_BUCKETS_IN_CHART);
  }

  private getTableRequest(baseRequest: FindBucketsRequestBuilder, context: TimeSeriesContext): FindBucketsRequest {
    return baseRequest
      .clone()
      .withNumberOfBuckets(1)
      .withGroupDimensions(context.getGroupDimensions())
      .withPercentiles([80, 90, 99])
      .build();
  }

  updateTableCompareData(): Observable<TimeSeriesAPIResponse> {
    let context = this.getContext(true);
    const request = this.getTableRequest(this.compareRequestBuilder, context);
    return this.timeSeriesService.getBuckets(request).pipe(
      tap((response) => {
        this.tableChart.updateCompareData(response, context);
      })
    );
  }

  disableCompareMode() {
    this.compareModeContext = undefined;
    this.compareModeEnabled = false;
    this.tableChart?.disableCompareMode();
    this.byKeywordsCompareChartResponseCache = undefined;
    this.selectedCompareThroughputMetric = this.throughputMetrics[0];
    this.compareTerminator$.next();
  }

  createByKeywordsCharts(compareChart = false): Observable<TimeSeriesAPIResponse> {
    const context = compareChart ? this.compareModeContext! : this.context;
    const groupDimensions = context.getGroupDimensions();
    const findRequest = this.getRequestBuilder(compareChart)
      .clone()
      .withGroupDimensions(groupDimensions)
      .withPercentiles([90, 99])
      .build();
    return this.timeSeriesService.getBuckets(findRequest).pipe(
      tap((response) => {
        // save the response for further metrics change
        if (compareChart) {
          this.byKeywordsCompareChartResponseCache = response;
        } else {
          this.byKeywordsChartResponseCache = response;
        }
        if (response.matrixKeys.length === 0) {
          // empty data
          if (!this.compareModeEnabled && this.responseTimeChart) {
            this.responseTimeChart?.clear();
            this.throughputChart?.clear();
            return;
          }
          if (this.compareModeEnabled && this.responseTimeCompareChart) {
            this.responseTimeCompareChart?.clear();
            this.throughputCompareChart?.clear();
            return;
          }
        }
        const timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
        const totalThroughput: number[] = response.matrix[0] ? Array(response.matrix[0]?.length) : [];
        const responseTimeSeries: TSChartSeries[] = [];
        const throughputSeries: TSChartSeries[] = [];
        const throughputMetric = this.compareModeEnabled
          ? this.selectedCompareThroughputMetric
          : this.selectedThroughputMetric;
        const responseTimeMetric = this.compareModeEnabled
          ? this.selectedCompareResponseTimeMetric
          : this.selectedResponseTimeMetric;
        response.matrixKeys.map((key, i) => {
          const seriesKey = this.getSeriesKey(key, groupDimensions);
          const responseTimeData: (number | null | undefined)[] = [];
          const color = this.keywordsService.getColor(seriesKey);
          const throughputData = response.matrix[i].map((b, j) => {
            const bucketValue = throughputMetric.mapFunction(b);
            if (totalThroughput[j] == undefined) {
              totalThroughput[j] = bucketValue;
            } else if (bucketValue) {
              totalThroughput[j] += bucketValue;
            }
            if (b) {
              responseTimeData.push(responseTimeMetric.mapFunction(b));
            } else {
              responseTimeData.push(undefined);
            }
            return bucketValue ? bucketValue : 0;
          });
          const keywordSelection = this.keywordsService.getKeywordSelection(seriesKey);
          const series = {
            scale: 'y',
            show: keywordSelection ? keywordSelection.isSelected : true,
            label: seriesKey,
            legendName: seriesKey,
            id: seriesKey,
            data: [], // will override it
            value: (x, v) => Math.trunc(v),
            stroke: color,
            points: { show: false },
          } as TSChartSeries;
          throughputSeries.push({ ...series, data: throughputData });
          responseTimeSeries.push({ ...series, data: responseTimeData });
          return series;
        });

        const throughputChartSettings: TSChartSettings = {
          title: 'Throughput',
          xValues: timeLabels,
          tooltipOptions: {
            enabled: true,
            zAxisLabel: throughputMetric.tooltipZAxisLabel,
          },
          series: [
            {
              scale: 'total',
              label: 'Total',
              legendName: 'Total',
              id: 'total',
              data: totalThroughput,
              value: (x, v) => Math.trunc(v) + ' total',
              fill: (self: uPlot) => UPlotUtils.gradientFill(self, TimeSeriesConfig.TOTAL_BARS_COLOR),
              paths: ChartGenerators.barsFunction({ size: [0.9, 100] }),
              points: { show: false },
            },
            ...throughputSeries,
          ],
          axes: [
            {
              scale: 'y',
              size: this.CHART_LEGEND_SIZE,
              values: (u, vals, space) =>
                vals.map((v) =>
                  this.compareModeEnabled
                    ? this.selectedCompareThroughputMetric.labelFunction(v)
                    : this.selectedThroughputMetric.labelFunction(v)
                ),
            },
            {
              side: 1,
              size: this.CHART_LEGEND_SIZE,
              scale: 'total',
              values: (u, vals, space) =>
                vals.map((v) =>
                  this.compareModeEnabled
                    ? this.selectedCompareThroughputMetric.labelFunction(v)
                    : this.selectedThroughputMetric.labelFunction(v)
                ),
              grid: { show: false },
            },
          ],
        };
        const responseTimeSettings: TSChartSettings = {
          title: TimeSeriesConfig.RESPONSE_TIME_CHART_TITLE + ` (${responseTimeMetric.label})`,
          xValues: timeLabels,
          series: responseTimeSeries,
          tooltipOptions: {
            enabled: true,
            yAxisUnit: 'ms',
          },
          axes: [
            {
              scale: 'y',
              size: this.CHART_LEGEND_SIZE,
              values: (u, vals, space) => vals.map((v) => UPlotUtils.formatMilliseconds(v)),
            },
          ],
        };

        if (compareChart) {
          this.compareChartsSettings[TsChartType.RESPONSE_TIME] = responseTimeSettings;
          this.compareChartsSettings[TsChartType.THROUGHPUT] = throughputChartSettings;
        } else {
          this.currentChartsSettings[TsChartType.RESPONSE_TIME] = responseTimeSettings;
          this.currentChartsSettings[TsChartType.THROUGHPUT] = throughputChartSettings;
        }
      })
    );
  }

  switchBaseChartResponseTimeMetric(metric: ResponseTimeMetric) {
    const chart = this.responseTimeChart;
    const responseCache = this.byKeywordsChartResponseCache;

    if (metric.label === this.selectedResponseTimeMetric.label || !chart || !responseCache) {
      return;
    }
    this.selectedResponseTimeMetric = metric;
    this.switchResponseTimeMetric(chart, responseCache, this.selectedResponseTimeMetric);
  }

  switchCompareResponseTimeMetric(metric: ResponseTimeMetric) {
    const chart = this.responseTimeCompareChart;
    const responseCache = this.byKeywordsCompareChartResponseCache;
    if (metric.label === this.selectedCompareResponseTimeMetric.label || !chart || !responseCache) {
      return;
    }
    this.selectedCompareResponseTimeMetric = metric;
    this.switchResponseTimeMetric(chart, responseCache, this.selectedCompareResponseTimeMetric);
  }

  private switchResponseTimeMetric(
    chart: TimeSeriesChartComponent,
    apiResponse: TimeSeriesAPIResponse,
    metric: ResponseTimeMetric
  ) {
    chart.setTitle(TimeSeriesConfig.RESPONSE_TIME_CHART_TITLE + ` (${metric.label})`);
    const data = chart.getData();
    apiResponse.matrix.map((bucketArray, i) => {
      data[i + 1] = bucketArray.map((b) => metric.mapFunction(b));
    });
    chart.setData(data, false);
  }

  private switchThroughputMetric(
    chart: TimeSeriesChartComponent,
    apiResponse: TimeSeriesAPIResponse,
    metric: ThroughputMetric
  ): void {
    chart.settings.tooltipOptions.zAxisLabel = metric.tooltipZAxisLabel;
    chart.legendSettings.zAxisLabel = metric.tooltipZAxisLabel;
    const data = chart.getData();
    const totalData = new Array(data[0].length);
    apiResponse.matrix.map((bucketArray, i) => {
      bucketArray.forEach((b, j) => {
        if (totalData[j] == null) {
          totalData[j] = 0;
        }
        const value = metric.mapFunction(b);
        totalData[j] += value;
        data[i + 2][j] = value;
      });
    });
    data[1] = totalData;
    chart.setData(data, false);
  }

  switchCompareThroughputMetric(metric: ThroughputMetric) {
    if (
      !this.throughputCompareChart ||
      metric.label === this.selectedCompareThroughputMetric.label ||
      !this.byKeywordsCompareChartResponseCache
    ) {
      return;
    }
    this.selectedCompareThroughputMetric = metric;
    this.switchThroughputMetric(this.throughputCompareChart, this.byKeywordsCompareChartResponseCache, metric);
  }

  switchBaseThroughputMetric(metric: ThroughputMetric) {
    if (metric.label === this.selectedThroughputMetric.label || !this.byKeywordsChartResponseCache) {
      return;
    }
    this.selectedThroughputMetric = metric;
    this.switchThroughputMetric(this.throughputChart, this.byKeywordsChartResponseCache, metric);
  }

  getSeriesKey(attributes: BucketAttributes, groupDimensions: string[]): string {
    if (Object.keys(attributes).length === 0) {
      return '<empty>';
    }
    return groupDimensions
      .map((field) => attributes[field])
      .filter((f) => !!f)
      .join(' | ');
  }

  private getContext(compareMode = false): TimeSeriesContext {
    return compareMode ? this.compareModeContext! : this.context;
  }

  getAllCharts() {
    return [this.summaryChart, this.byStatusChart, this.responseTimeChart, this.throughputChart, this.threadGroupChart];
  }

  getAllCompareCharts() {
    return [
      this.summaryCompareChart,
      this.byStatusCompareChart,
      this.responseTimeCompareChart,
      this.throughputCompareChart,
      this.threadGroupCompareChart,
    ];
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
    this.compareTerminator$.next();
    this.compareTerminator$.complete();
  }

  get TsChartType() {
    return TsChartType;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPerformanceView', downgradeComponent({ component: ChartsViewComponent }));
