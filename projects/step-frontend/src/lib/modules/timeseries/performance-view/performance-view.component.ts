import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, BucketAttributes, Execution } from '@exense/step-core';
import { TSChartSeries, TSChartSettings } from '../chart/model/ts-chart-settings';
import { TimeSeriesService } from '../time-series.service';
import { FindBucketsRequest } from '../find-buckets-request';
import { TimeSeriesChartComponent } from '../chart/time-series-chart.component';
import { KeyValue } from '@angular/common';
import { TSRangerComponent } from '../ranger/ts-ranger.component';
import { UPlotUtils } from '../uplot/uPlot.utils';
import { TimeSeriesConfig } from '../time-series.config';
import { TimeseriesTableComponent } from './table/timeseries-table.component';
import { first, forkJoin, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { TimeSeriesUtils } from '../time-series-utils';
import { TimeSeriesContext } from '../time-series-context';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';
import { KeywordSelection, TimeSeriesKeywordsContext } from '../execution-page/time-series-keywords.context';
import { Bucket } from '../bucket';
import { TimeSeriesChartResponse } from '../time-series-chart-response';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';
import { PerformanceViewSettings } from './model/performance-view-settings';
import { ChartGenerators } from './chart-generators/chart-generators';
import { TsChartType } from './model/ts-chart-type';
import { ExecutionFiltersComponent } from './filters/execution-filters.component';
import { PerformanceViewTimeSelectionComponent } from './time-selection/performance-view-time-selection.component';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { ThroughputMetric } from './model/throughput-metric';
import { PerformanceViewConfig } from './performance-view.config';
import { UpdatePerformanceViewRequest } from './model/update-performance-view-request';

declare const uPlot: any;

@Component({
  selector: 'step-performance-view',
  templateUrl: './performance-view.component.html',
  styleUrls: ['./performance-view.component.scss'],
})
export class PerformanceViewComponent implements OnInit, OnDestroy {
  private readonly METRIC_TYPE_KEY = 'metricType';
  private readonly METRIC_TYPE_RESPONSE_TIME = 'response-time'; // this is for normal measurements
  private readonly METRIC_TYPE_SAMPLER = 'sampler'; // this is for thread groups measurements

  private CHART_LEGEND_SIZE = 65;

  rangerSettings: TSChartSettings | undefined;

  // key: TsChartType. here we keep all chart settings (by TsChartType
  currentChartsSettings: { [key: string]: TSChartSettings } = {};

  @ViewChild(ExecutionFiltersComponent) filtersComponent!: ExecutionFiltersComponent;
  @ViewChild('ranger') ranger!: TSRangerComponent;
  @ViewChild('throughputChart') throughputChart!: TimeSeriesChartComponent;
  @ViewChild('summaryChart') summaryChart!: TimeSeriesChartComponent;
  @ViewChild('byStatusChart') byStatusChart!: TimeSeriesChartComponent;
  @ViewChild('responseTimeChart') responseTimeChart!: TimeSeriesChartComponent;
  @ViewChild('threadGroupChart') threadGroupChart!: TimeSeriesChartComponent;
  @ViewChild('tableChart') tableChart!: TimeseriesTableComponent;

  @ViewChild(PerformanceViewTimeSelectionComponent) timeSelectionComponent!: PerformanceViewTimeSelectionComponent;

  @Input() context!: TimeSeriesContext;
  @Input() settings!: PerformanceViewSettings;
  @Input() includeThreadGroupChart = true;

  @Output() onInitializationComplete: EventEmitter<void> = new EventEmitter<void>();
  @Output() onUpdateComplete: EventEmitter<void> = new EventEmitter<void>();

  private tableInitialized$ = new Subject<void>();
  private rangerLoaded$ = new Subject<void>();
  chartsAreLoading = false;

  keywords: { [key: string]: KeywordSelection } = {};
  keywordSearchValue: string = '';

  byKeywordsChartResponseCache?: TimeSeriesChartResponse; // for caching

  findRequest!: FindBucketsRequest;
  groupDimensions: string[] = [];

  execution: Execution | undefined;
  executionStart: number = 0;
  executionInProgress = false;
  refreshEnabled = false;

  // this is just for running executions
  refreshIntervals: RefreshInterval[] = [
    { label: '5 Sec', value: 5000 },
    { label: '30 Sec', value: 30 * 1000 },
    { label: '1 Min', value: 60 * 1000 },
    { label: '5 Min', value: 5 * 60 * 1000 },
    { label: '30 Min', value: 30 * 60 * 1000 },
    { label: 'Off', value: 0 },
  ];
  selectedRefreshInterval: RefreshInterval = this.refreshIntervals[0];

  terminator$ = new Subject<void>();
  intervalShouldBeCanceled = false;

  allSeriesChecked: boolean = true;

  private keywordsService!: TimeSeriesKeywordsContext;

  responseTimeMetrics = PerformanceViewConfig.responseTimeMetrics;
  selectedResponseTimeMetric = this.responseTimeMetrics[0];

  throughputMetrics = PerformanceViewConfig.throughputMetrics;
  selectedThroughputMetric = this.throughputMetrics[0];

  initializationTasks: Observable<any>[] = [];
  updateTasks: Observable<any>[] = [];

  valueAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.key.localeCompare(b.key);
  };

  constructor(private timeSeriesService: TimeSeriesService) {}

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
    this.findRequest = this.prepareFindRequest(this.settings);
    this.initContext();
    this.keywordsService
      .onAllSelectionChanged()
      .pipe(takeUntil(this.terminator$))
      .subscribe((selected) => {
        this.allSeriesChecked = selected;
      });
    this.keywordsService
      .onKeywordToggled()
      .pipe(takeUntil(this.terminator$))
      .subscribe((selection) => {
        this.throughputChart.setSeriesVisibility(selection.id, selection.isSelected);
        this.responseTimeChart.setSeriesVisibility(selection.id, selection.isSelected);
        this.keywords[selection.id] = selection;
      });
    this.keywordsService
      .onKeywordsUpdated()
      .pipe(takeUntil(this.terminator$))
      .subscribe((keywords) => {
        this.keywords = keywords;
      });
    this.context
      .onSelectedTimeRangeChange()
      .pipe(
        switchMap((newRange) => this.handleZoomChange(newRange)),
        takeUntil(this.terminator$)
      )
      .subscribe();

    this.context
      .onFiltersChange()
      .pipe(
        tap(() => (this.chartsAreLoading = true)),
        switchMap(() => this.refreshAllCharts(true)),
        tap(() => (this.chartsAreLoading = false)),
        takeUntil(this.terminator$)
      )
      .subscribe();
    this.context
      .onGroupingChange()
      .pipe(
        tap((groupDimensions: string[]) => {
          this.groupDimensions = groupDimensions;
          this.mergeRequestWithActiveFilters(this.findRequest);
        }),
        tap(() => (this.chartsAreLoading = true)),
        switchMap(() => this.refreshAllCharts(true)),
        tap(() => (this.chartsAreLoading = false)),
        takeUntil(this.terminator$)
      )
      .subscribe();

    this.createAllCharts(this.findRequest);
  }

  /**
   * This method will reconstruct all charts.
   * @param range
   */
  updateFullRange(range: TSTimeRange): void {
    this.context.updateFullRange(range, false);
    this.timeSelectionComponent.updateFullTimeRange(range);
    this.settings.timeRange = range;
    this.findRequest.start = range.from;
    this.findRequest.end = range.to;
  }

  updateDashboard(request: UpdatePerformanceViewRequest): Observable<any> {
    // let's assume the complete interval and selections are set.
    this.context.updateFullRange(request.fullTimeRange, false);
    this.context.updateSelectedRange(request.selection, false);
    let updates$ = [];
    if (request.updateRanger) {
      updates$.push(this.timeSelectionComponent.refreshRanger());
    }
    if (request.updateCharts) {
      updates$.push(this.refreshAllCharts());
    }
    return forkJoin(updates$);
  }

  handleZoomChange(range: TSTimeRange): Observable<any> {
    if (this.findRequest.start === range.from && this.findRequest.end === range.to) {
      return of(undefined);
    }
    this.getAllCharts().forEach((chart) => {
      chart?.setBlur(true);
    });
    this.findRequest = {
      ...this.findRequest,
      start: range.from,
      end: range.to,
    };
    return this.refreshAllCharts(true);
  }

  deleteObjectProperties(object: any, keys: string[]) {
    if (!keys) {
      return;
    }
    keys.forEach((key) => delete object[key]);
  }

  private initContext() {
    this.keywordsService = this.context.keywordsContext;
  }

  prepareFindRequest(settings: PerformanceViewSettings, customFilters?: any): FindBucketsRequest {
    const numberOfBuckets = TimeSeriesConfig.MAX_BUCKETS_IN_CHART;
    return {
      start: settings.timeRange.from,
      end: settings.timeRange.to,
      numberOfBuckets: numberOfBuckets,
      params: {
        ...settings.contextualFilters,
        [this.METRIC_TYPE_KEY]: this.METRIC_TYPE_RESPONSE_TIME,
        ...customFilters,
      },
    };
  }

  onTableInitializationFinished() {
    this.tableInitialized$.next();
  }

  onRangerLoaded() {
    this.rangerLoaded$.next();
  }

  createAllCharts(findRequest: FindBucketsRequest) {
    const charts$ = [
      this.createSummaryChart(findRequest),
      this.createByStatusChart(findRequest),
      this.createByKeywordsCharts(findRequest),
      this.tableInitialized$.pipe(first()), // the table will render automatically once this.findRequest is set.
      this.rangerLoaded$.pipe(first()),
    ];
    if (this.includeThreadGroupChart) {
      charts$.push(this.createThreadGroupsChart(findRequest));
    }

    forkJoin(charts$)
      .pipe(takeUntil(this.terminator$))
      .subscribe((allCompleted) => this.onInitializationComplete.emit());
  }

  /**
   * This method is called while live refreshing.
   * force = true -> The charts ar forced to refresh, even if the time interval was the same (because of filters/grouping change).
   */
  refreshAllCharts(force = false): Observable<unknown> {
    this.findRequest = this.prepareFindRequest(this.settings); // we don't want to lose active filters
    this.mergeRequestWithActiveFilters(this.findRequest);
    let fullTimeRange = this.context.getSelectedTimeRange();
    this.findRequest.start = fullTimeRange.from;
    this.findRequest.end = fullTimeRange.to;

    const charts$ = [
      this.createSummaryChart(this.findRequest),
      this.createByStatusChart(this.findRequest),
      this.createByKeywordsCharts(this.findRequest),
      this.updateTable(this.findRequest),
    ];
    if (this.includeThreadGroupChart) {
      charts$.push(this.createThreadGroupsChart(this.findRequest));
    }

    return forkJoin(charts$);
  }

  mergeRequestWithActiveFilters(request: FindBucketsRequest) {
    this.deleteObjectProperties(request.params, this.filtersComponent?.getAllFilterAttributes()); // we clean the request first
    Object.assign(request.params, this.context.getActiveFilters());
  }

  onKeywordToggle(keyword: string, event: any) {
    this.keywordsService.toggleKeyword(keyword);
  }

  onChartsZoomReset() {
    this.context.resetZoom();
  }

  createThreadGroupsChart(request: FindBucketsRequest, isUpdate = false): Observable<TimeSeriesChartResponse> {
    let updatedParams: { [key: string]: string } = {
      ...request.params,
      [this.METRIC_TYPE_KEY]: this.METRIC_TYPE_SAMPLER,
    };
    this.deleteObjectProperties(updatedParams, this.filtersComponent?.getAllFilterAttributes()); // we remove all custom filters
    return this.timeSeriesService
      .fetchBuckets({ ...request, params: updatedParams, groupDimensions: ['name'] })
      .pipe(tap((response) => this.createChart(TsChartType.THREAD_GROUP, request, response)));
  }

  createChart(type: TsChartType, request: FindBucketsRequest, response: TimeSeriesChartResponse) {
    // all charts should be created and grouped via this principle in the end.
    const existingChart = this.getChart(type);
    if (response.matrixKeys.length === 0 && existingChart) {
      // empty data
      existingChart.clear();
      return;
    }
    this.currentChartsSettings[type] = ChartGenerators.generateChart(
      type,
      request,
      response,
      this.context.keywordsContext.colorsPool
    );
  }

  /**
   * This method is used for both creating or updating the chart
   */
  createSummaryChart(request: FindBucketsRequest): Observable<TimeSeriesChartResponse> {
    return this.timeSeriesService
      .fetchBuckets(request)
      .pipe(tap((response) => this.createChart(TsChartType.OVERVIEW, request, response)));
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
    }
  }

  createByStatusChart(request: FindBucketsRequest): Observable<TimeSeriesChartResponse> {
    request = { ...request, groupDimensions: [TimeSeriesConfig.STATUS_ATTRIBUTE] };
    return this.timeSeriesService
      .fetchBuckets(request)
      .pipe(tap((response) => this.createChart(TsChartType.BY_STATUS, request, response)));
  }

  createByKeywordsCharts(request: FindBucketsRequest): Observable<TimeSeriesChartResponse> {
    let groupDimensions = this.context.getGroupDimensions();
    return this.timeSeriesService
      .fetchBuckets({ ...request, groupDimensions: groupDimensions, percentiles: [90, 99] })
      .pipe(
        tap((response) => {
          this.byKeywordsChartResponseCache = response;
          if (response.matrixKeys.length === 0) {
            // empty data
            if (this.responseTimeChart) {
              this.responseTimeChart?.clear();
              this.throughputChart?.clear();
              return;
            }
          }
          let timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
          let totalThroughput: number[] = response.matrix[0] ? Array(response.matrix[0]?.length) : [];
          let responseTimeSeries: TSChartSeries[] = [];
          let throughputSeries: TSChartSeries[] = [];
          response.matrixKeys.map((key, i) => {
            key = this.getSeriesKey(key, groupDimensions);
            let responseTimeData: (number | null | undefined)[] = [];
            let color = this.keywordsService.getColor(key);
            let countData = response.matrix[i].map((b, j) => {
              let bucketValue = b?.throughputPerHour;
              if (totalThroughput[j] == undefined) {
                totalThroughput[j] = bucketValue;
              } else if (bucketValue) {
                totalThroughput[j] += bucketValue;
              }
              if (b) {
                responseTimeData.push(this.selectedResponseTimeMetric.mapFunction(b));
              } else {
                responseTimeData.push(undefined);
              }
              return bucketValue ? bucketValue : 0;
            });
            let keywordSelection = this.keywordsService.getKeywordSelection(key);
            let series = {
              scale: 'y',
              show: keywordSelection ? keywordSelection.isSelected : true,
              label: key,
              legendName: key,
              id: key,
              data: [], // will override it
              value: (x, v) => Math.trunc(v),
              stroke: color,
              points: { show: false },
            } as TSChartSeries;
            throughputSeries.push({ ...series, data: countData });
            responseTimeSeries.push({ ...series, data: responseTimeData });
            return series;
          });

          this.currentChartsSettings[TsChartType.THROUGHPUT] = {
            title: 'Throughput',
            xValues: timeLabels,
            tooltipOptions: {
              enabled: true,
              zAxisLabel: this.selectedThroughputMetric.tooltipZAxisLabel,
            },
            series: [
              {
                scale: 'total',
                label: 'Total',
                legendName: 'Total',
                id: 'secondary',
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
                values: (u, vals, space) => vals.map((v) => TimeSeriesUtils.formatAxisValue(v) + '/h'),
              },
              {
                side: 1,
                size: this.CHART_LEGEND_SIZE,
                scale: 'total',
                values: (u, vals, space) => vals.map((v) => TimeSeriesUtils.formatAxisValue(v) + '/h'),
                grid: { show: false },
              },
            ],
          };

          this.currentChartsSettings[TsChartType.RESPONSE_TIME] = {
            title: TimeSeriesConfig.RESPONSE_TIME_CHART_TITLE + ` (${this.selectedResponseTimeMetric.label})`,
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
        })
      );
  }

  updateTable(request: FindBucketsRequest): Observable<TimeSeriesChartResponse> {
    if (!this.tableChart) {
      throw 'Table does not exist yet';
    }
    return this.tableChart.refresh(request); // refresh the table
  }

  switchResponseTimeMetric(metric: { label: string; mapFunction: (b: Bucket) => number }) {
    this.responseTimeChart.setTitle(TimeSeriesConfig.RESPONSE_TIME_CHART_TITLE + ` (${metric.label})`);
    if (metric.label === this.selectedResponseTimeMetric.label) {
      // it is a real change
      return;
    }
    if (!this.byKeywordsChartResponseCache) {
      return;
    }
    this.selectedResponseTimeMetric = metric;
    let data = this.responseTimeChart.getData();
    this.byKeywordsChartResponseCache.matrix.map((bucketArray, i) => {
      data[i + 1] = bucketArray.map((b) => this.selectedResponseTimeMetric.mapFunction(b));
    });
    this.responseTimeChart.setData(data, false);
  }

  switchThroughputMetric(metric: ThroughputMetric) {
    let f = (u: any, vals: any) => vals.map((v: number) => metric.labelFunction(v));
    this.throughputChart.settings.tooltipOptions.zAxisLabel = metric.tooltipZAxisLabel;
    this.throughputChart.uplot.axes[1].values = f;
    this.throughputChart.uplot.axes[2].values = f;
    if (metric.label === this.selectedResponseTimeMetric.label) {
      // it is not a real change
      return;
    }
    if (!this.byKeywordsChartResponseCache) {
      return;
    }
    this.selectedThroughputMetric = metric;
    let data = this.throughputChart.getData();
    let totalData = new Array(data[0].length);
    this.byKeywordsChartResponseCache.matrix.map((bucketArray, i) => {
      bucketArray.forEach((b, j) => {
        if (totalData[j] == null) {
          totalData[j] = 0;
        }
        let value = this.selectedThroughputMetric.mapFunction(b);
        totalData[j] += value;
        data[i + 1][j] = value;
      });
    });
    data[data.length - 1] = totalData;
    this.throughputChart.setData(data, false);
  }

  getSeriesKey(attributes: BucketAttributes, groupDimensions: string[]) {
    return groupDimensions
      .map((field) => attributes[field])
      .filter((f) => !!f)
      .join(' | ');
  }

  getAllCharts() {
    return [this.summaryChart, this.byStatusChart, this.responseTimeChart, this.throughputChart, this.threadGroupChart];
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.tableInitialized$.complete();
    this.rangerLoaded$.complete();
  }

  get TsChartType() {
    return TsChartType;
  }
}

interface RefreshInterval {
  label: string;
  value: number; // 0 if it's off
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPerformanceView', downgradeComponent({ component: PerformanceViewComponent }));
