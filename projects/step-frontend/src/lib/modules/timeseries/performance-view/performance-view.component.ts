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
import { first, forkJoin, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { TimeSeriesUtils } from '../time-series-utils';
import { TimeSeriesContext } from '../execution-page/time-series-context';
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
import { ThroughputMetric } from './model/throughput-metric';
import { PerformanceViewConfig } from './performance-view.config';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { TSTimeRange } from '../chart/model/ts-time-range';

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

  // key: TsChartType
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

  // @Input() executionId!: string;
  @Input() settings!: PerformanceViewSettings;
  @Input() includeThreadGroupChart = true;
  @Input() includeTimeRangePicker = true;

  @Output() onInitializationComplete: EventEmitter<void> = new EventEmitter<void>();
  @Output() onUpdateComplete: EventEmitter<void> = new EventEmitter<void>();

  private tableInitialized$ = new Subject<void>();
  private rangerLoaded$ = new Subject<void>();
  chartsAreLoading = false;

  barsFunction = uPlot.paths.bars; // this is a function from uplot which allows to draw bars instead of straight lines
  stepped = uPlot.paths.stepped; // this is a function from uplot wich allows to draw 'stepped' or 'stairs like' lines

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
  timeSelection!: ExecutionTimeSelection;

  terminator$ = new Subject<void>();
  intervalShouldBeCanceled = false;

  allSeriesChecked: boolean = true;

  private keywordsService!: TimeSeriesKeywordsContext;

  responseTimeMetrics = PerformanceViewConfig.responseTimeMetrics;
  selectedResponseTimeMetric = this.responseTimeMetrics[0];

  throughputMetrics = PerformanceViewConfig.throughputMetrics;
  selectedThroughputMetric = this.throughputMetrics[0];

  executionContext!: TimeSeriesContext;

  initializationTasks: Observable<any>[] = [];
  updateTasks: Observable<any>[] = [];

  valueAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.key.localeCompare(b.key);
  };

  constructor(private timeSeriesService: TimeSeriesService, private contextFactory: TimeSeriesContextsFactory) {}

  onAllSeriesCheckboxClick(event: any) {
    this.keywordsService.toggleSelectAll();
  }

  getTimeRangeSelection() {
    return this.timeSelectionComponent.getActiveSelection();
  }

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Settings input is not specified!');
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
    this.executionContext.timeSelectionState
      .onActiveSelectionChange()
      .pipe(
        tap((newRange) => (this.timeSelection = newRange)),
        switchMap((newRange) => this.handleZoomChange(newRange)),
        takeUntil(this.terminator$)
      )
      .subscribe();
    // this.executionContext.timeSelectionState
    //   .onZoomReset()
    //   .pipe(takeUntil(this.terminator$))
    //   .subscribe(() => this.handleZoomReset());

    this.executionContext
      .onFiltersChange()
      .pipe(
        tap(() => (this.chartsAreLoading = true)),
        switchMap(() => this.updateAllCharts()),
        tap(() => (this.chartsAreLoading = false)),
        takeUntil(this.terminator$)
      )
      .subscribe();
    this.executionContext
      .onGroupingChange()
      .pipe(
        tap((groupDimensions: string[]) => {
          this.groupDimensions = groupDimensions;
          this.mergeRequestWithActiveFilters(this.findRequest);
        }),
        tap(() => (this.chartsAreLoading = true)),
        switchMap(() => this.updateAllCharts()),
        tap(() => (this.chartsAreLoading = false)),
        takeUntil(this.terminator$)
      )
      .subscribe();

    this.createAllCharts(this.findRequest);
  }

  getAllCharts() {
    return [this.summaryChart, this.byStatusChart, this.responseTimeChart, this.throughputChart, this.threadGroupChart];
  }

  handleZoomChange(range: ExecutionTimeSelection): Observable<any> {
    console.log('ZOOM CHANGE');
    this.getAllCharts().forEach((chart) => {
      chart?.setBlur(true);
    });
    this.findRequest = {
      ...this.findRequest,
      start: range.absoluteSelection!.from!,
      end: range.absoluteSelection!.to!,
    };
    this.createAllCharts(this.findRequest);
    return this.updateTable(this.findRequest);
  }

  deleteObjectProperties(object: any, keys: string[]) {
    if (!keys) {
      return;
    }
    keys.forEach((key) => delete object[key]);
  }

  private initContext() {
    this.executionContext = this.contextFactory.getContext(this.settings.contextId);
    this.keywordsService = this.executionContext.keywordsContext;
  }

  prepareFindRequest(settings: PerformanceViewSettings, customFilters?: any): FindBucketsRequest {
    const numberOfBuckets = TimeSeriesConfig.MAX_BUCKETS_IN_CHART;
    return {
      start: settings.startTime,
      end: settings.endTime,
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

  calculateTimeIntervalForCurrentSelection(settings: PerformanceViewSettings): { start: number; end: number } {
    let start = settings.startTime;
    let end = settings.endTime;
    let activeTimeSelection = this.executionContext.timeSelectionState.activeTimeSelection;
    switch (activeTimeSelection.type) {
      case RangeSelectionType.FULL:
        // do nothing
        break;
      case RangeSelectionType.ABSOLUTE:
        start = activeTimeSelection.absoluteSelection!.from || settings.startTime;
        end = activeTimeSelection.absoluteSelection!.to || settings.endTime;
        break;
      case RangeSelectionType.RELATIVE:
        let now = new Date().getTime();
        end = now;
        start = now - activeTimeSelection.relativeSelection!.timeInMs;
        break;
    }
    return { start: start, end: end };
  }

  updateAllCharts(): Observable<unknown> {
    this.findRequest = this.prepareFindRequest(this.settings); // we don't want to lose active filters
    this.mergeRequestWithActiveFilters(this.findRequest);
    let timeRange = this.calculateTimeIntervalForCurrentSelection(this.settings);
    this.findRequest.start = timeRange.start;
    this.findRequest.end = timeRange.end;

    const charts$ = [
      this.createSummaryChart(this.findRequest),
      this.createByStatusChart(this.findRequest),
      this.createByKeywordsCharts(this.findRequest),
      this.updateTable(this.findRequest),
      this.timeSelectionComponent.refreshRanger(),
    ];
    if (this.includeThreadGroupChart) {
      charts$.push(this.createThreadGroupsChart(this.findRequest));
    }

    return forkJoin(charts$);
  }

  mergeRequestWithActiveFilters(request: FindBucketsRequest) {
    this.deleteObjectProperties(request.params, this.filtersComponent.getAllFilterAttributes()); // we clean the request first
    Object.assign(request.params, this.executionContext.getActiveFilters());
  }

  onKeywordToggle(keyword: string, event: any) {
    this.keywordsService.toggleKeyword(keyword);
  }

  onChartsZoomReset() {
    this.executionContext.timeSelectionState.resetZoom({ from: this.settings.startTime, to: this.settings.endTime });
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
      this.executionContext.keywordsContext.colorsPool
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
    let groupDimensions = this.executionContext.getGroupDimensions();
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
                paths: this.barsFunction({ size: [0.9, 100] }),
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
    // let newRange = this.executionContext.timeSelectionState.getActiveSelection().absoluteSelection;
    // if (!newRange) {
    //   // we have a full selection
    //   return this.tableChart.refresh(this.findRequest); // refresh the table
    // }
    // // we make a clone in order to not pollute the global request, since we change from and to params
    // let clonedRequest = JSON.parse(JSON.stringify(this.findRequest));
    // if (newRange.from) {
    //   clonedRequest.start = Math.trunc(newRange.from);
    // }
    // if (newRange.to) {
    //   clonedRequest.end = Math.trunc(newRange.to);
    // }
    return this.tableChart.refresh(request); // refresh the table
  }

  handleZoomReset() {
    // the charts will reset because they are linked to the ranger.
    this.findRequest = this.prepareFindRequest(this.settings);
    // console.log(new Date(this.findRequest.start));
    this.createAllCharts(this.findRequest);
    this.updateTable(this.findRequest).subscribe();
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
