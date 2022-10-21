import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, BucketAttributes, Execution, ExecutionsService } from '@exense/step-core';
import { TSChartSeries, TSChartSettings } from '../chart/model/ts-chart-settings';
import { TimeSeriesService } from '../time-series.service';
import { FindBucketsRequest } from '../find-buckets-request';
import { TimeSeriesChartComponent } from '../chart/time-series-chart.component';
import { KeyValue } from '@angular/common';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TSRangerComponent } from '../ranger/ts-ranger.component';
import { UPlotUtils } from '../uplot/uPlot.utils';
import { TimeSeriesConfig } from '../time-series.config';
import { TimeseriesTableComponent } from './table/timeseries-table.component';
import { first, forkJoin, Observable, of, Subject, Subscription, take, takeUntil, tap } from 'rxjs';
import { TimeSeriesUtils } from '../time-series-utils';
import { TimeSeriesContext } from '../execution-page/time-series-context';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';
import { KeywordSelection, TimeSeriesKeywordsContext } from '../execution-page/time-series-keywords.context';
import { Bucket } from '../bucket';
import { TimeSeriesChartResponse } from '../time-series-chart-response';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';
import { PerformanceViewSettings } from './performance-view-settings';
import { ChartGenerators } from './chart-generators/chart-generators';
import { TsChartType } from './ts-chart-type';
import { ExecutionFiltersComponent } from './filters/execution-filters.component';
import { PerformanceViewTimeSelectionComponent } from './time-selection/performance-view-time-selection.component';

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

  summaryChartSettings: TSChartSettings | undefined;
  byStatusSettings: TSChartSettings | undefined;
  throughputChartSettings: TSChartSettings | undefined;
  responseTypeByKeywordsSettings: TSChartSettings | undefined;
  threadGroupSettings: TSChartSettings | undefined;
  rangerSettings: TSChartSettings | undefined;

  // key: TsChartType
  chartsSettings: { [key: string]: TSChartSettings } = {};

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

  subscriptionsTerminator$ = new Subject<void>();
  intervalShouldBeCanceled = false;

  allSeriesChecked: boolean = true;

  private keywordsService!: TimeSeriesKeywordsContext;

  responseTimeMetrics = [
    { label: 'Avg', mapFunction: (b: Bucket) => b.sum / b.count },
    { label: 'Min', mapFunction: (b: Bucket) => b.min },
    { label: 'Max', mapFunction: (b: Bucket) => b.max },
    { label: 'Perc. 90', mapFunction: (b: Bucket) => b.pclValues[90] },
    { label: 'Perc. 99', mapFunction: (b: Bucket) => b.pclValues[99] },
  ];
  selectedMetric = this.responseTimeMetrics[0];

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
      .pipe(takeUntil(this.subscriptionsTerminator$))
      .subscribe((selected) => {
        this.allSeriesChecked = selected;
      });
    this.keywordsService
      .onKeywordToggled()
      .pipe(takeUntil(this.subscriptionsTerminator$))
      .subscribe((selection) => {
        this.throughputChart.setSeriesVisibility(selection.id, selection.isSelected);
        this.responseTimeChart.setSeriesVisibility(selection.id, selection.isSelected);
        this.keywords[selection.id] = selection;
      });
    this.keywordsService
      .onKeywordsUpdated()
      .pipe(takeUntil(this.subscriptionsTerminator$))
      .subscribe((keywords) => {
        this.keywords = keywords;
      });
    this.executionContext.timeSelectionState
      .onActiveSelectionChange()
      .pipe(takeUntil(this.subscriptionsTerminator$))
      .subscribe((newRange) => {
        this.timeSelection = newRange;
        this.updateTable().subscribe();
        // the event is handled from the parent, so no action needed here.
      });
    this.executionContext.timeSelectionState
      .onZoomReset()
      .pipe(takeUntil(this.subscriptionsTerminator$))
      .subscribe(() => this.handleZoomReset());

    this.executionContext
      .onFiltersChange()
      .pipe(takeUntil(this.subscriptionsTerminator$))
      .subscribe((filters) => {
        this.updateAllCharts().subscribe();
      });
    this.executionContext
      .onGroupingChange()
      .pipe(takeUntil(this.subscriptionsTerminator$))
      .subscribe((groupDimensions: string[]) => {
        this.groupDimensions = groupDimensions;
        this.mergeRequestWithActiveFilters();
        this.createByKeywordsCharts({ ...this.findRequest, groupDimensions: groupDimensions });
        this.updateAllCharts().subscribe();
      });

    this.createAllCharts();
  }

  deleteObjectProperties(object: any, keys: string[]) {
    if (!keys) {
      return;
    }
    keys.forEach((key) => delete object[key]);
  }

  private initContext() {
    this.executionContext = this.contextFactory.getContext(this.settings.contextId);
    this.keywordsService = this.executionContext.getKeywordsContext();
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

  createAllCharts() {
    const charts$ = [
      this.createSummaryChart(this.findRequest),
      this.createByStatusChart(this.findRequest),
      this.createByKeywordsCharts(this.findRequest),
      this.tableInitialized$.pipe(first()),
      this.rangerLoaded$.pipe(first()),
    ];
    if (this.includeThreadGroupChart) {
      charts$.push(this.createThreadGroupsChart(this.findRequest));
    }

    forkJoin(charts$)
      .pipe(takeUntil(this.subscriptionsTerminator$))
      .subscribe((allCompleted) => this.onInitializationComplete.emit());
  }

  updateAllCharts(): Observable<unknown> {
    this.chartsAreLoading = true;
    this.findRequest = this.prepareFindRequest(this.settings); // we don't want to lose active filters
    this.mergeRequestWithActiveFilters();

    const charts$ = [
      this.createSummaryChart(this.findRequest),
      this.createByStatusChart(this.findRequest),
      this.createByKeywordsCharts(this.findRequest),
      this.updateTable(),
      this.timeSelectionComponent.refreshRanger(),
    ];
    if (this.includeThreadGroupChart) {
      charts$.push(this.createThreadGroupsChart(this.findRequest));
    }

    return forkJoin(charts$).pipe(tap(() => (this.chartsAreLoading = false)));
  }

  mergeRequestWithActiveFilters() {
    this.deleteObjectProperties(this.findRequest.params, this.filtersComponent.getAllFilterAttributes()); // we clean the request first
    Object.assign(this.findRequest.params, this.executionContext.getActiveFilters());
  }

  onKeywordToggle(keyword: string, event: any) {
    this.keywordsService.toggleKeyword(keyword);
  }

  onZoomReset() {
    this.executionContext.timeSelectionState.resetZoom();
    // this.timeSelectionComponent.resetZoom();
  }

  createThreadGroupsChart(request: FindBucketsRequest, isUpdate = false): Observable<TimeSeriesChartResponse> {
    let dimensionKey = 'name';
    let updatedParams: { [key: string]: string } = {
      ...request.params,
      [this.METRIC_TYPE_KEY]: this.METRIC_TYPE_SAMPLER,
    };
    this.deleteObjectProperties(updatedParams, this.filtersComponent?.getAllFilterAttributes()); // we remove all custom filters
    return this.timeSeriesService.fetchBuckets({ ...request, params: updatedParams }).pipe(
      tap((response) => {
        let timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
        if (response.matrix.length === 0 && this.threadGroupChart) {
          this.threadGroupChart.clear();
          return;
        }
        let totalData: number[] = response.matrix[0] ? Array(response.matrix[0].length) : [];
        let dynamicSeries = response.matrixKeys.map((key, i) => {
          key = key[dimensionKey]; // get just the name
          let filledData = response.matrix[i].map((b, j) => {
            let bucketValue = b?.max;
            if (bucketValue == null && j > 0) {
              // we try to keep a constant line
              bucketValue = response.matrix[i][j - 1]?.max;
            }
            if (totalData[j] === undefined) {
              totalData[j] = bucketValue;
            } else if (bucketValue) {
              totalData[j] += bucketValue;
            }
            return bucketValue;
          });
          return {
            scale: 'y',
            label: key,
            id: key,
            data: filledData,
            value: (x, v) => Math.trunc(v),
            stroke: '#024981',
            width: 2,
            paths: this.stepped({ align: 1 }),
            points: { show: false },
          } as TSChartSeries;
        });
        this.threadGroupSettings = {
          title: 'Thread Groups (Concurrency)',
          xValues: timeLabels,
          showLegend: true,
          cursor: {
            dataIdx: UPlotUtils.closestNotEmptyPointFunction,
          },
          series: [
            {
              id: 'total',
              scale: 'total',
              label: 'Total',
              data: totalData,
              value: (x, v) => Math.trunc(v),
              // stroke: '#E24D42',
              fill: (self: uPlot) => UPlotUtils.gradientFill(self, '#8FA1D2'),
              // fill: 'rgba(255,212,166,0.64)',
              // points: {show: false},
              // drawStyle: 1,
              paths: this.stepped({ align: 1 }),
              points: { show: false },
            },
            ...dynamicSeries,
          ],
          axes: [
            {
              scale: 'y',
              size: this.CHART_LEGEND_SIZE,
              values: (u, vals, space) => vals.map((v) => v),
            },
            {
              side: 1,
              size: this.CHART_LEGEND_SIZE,
              scale: 'total',
              values: (u, vals, space) => vals.map((v) => v),
              grid: { show: false },
            },
          ],
        };
      })
    );
  }

  createChart(type: TsChartType, request: FindBucketsRequest, response: TimeSeriesChartResponse) {
    // all charts should be created and grouped via this principle in the end.
    let existingChart = this.getChart(type);
    if (response.matrixKeys.length === 0 && existingChart) {
      // empty data
      existingChart.clear();
      return;
    }
    this.chartsSettings[type] = ChartGenerators.generateChart(type, request, response);
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
    let statusAttribute = 'rnStatus';
    return this.timeSeriesService.fetchBuckets({ ...request, groupDimensions: [statusAttribute] }).pipe(
      tap((response) => {
        if (response.matrixKeys.length === 0 && this.byStatusChart) {
          // empty data
          this.byStatusChart?.clear();
          return;
        }
        let xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
        let series: TSChartSeries[] = response.matrix.map((series, i) => {
          let status = response.matrixKeys[i][statusAttribute];
          let color = this.keywordsService.getStatusColor(status);
          status = status || 'No Status';

          return {
            id: status,
            label: status,
            data: series.map((b) => (b ? b.throughputPerHour : 0)),
            // scale: 'mb',
            value: (self, x) => TimeSeriesUtils.formatAxisValue(x) + '/h',
            stroke: color,
            fill: (self: uPlot, seriesIdx: number) => UPlotUtils.gradientFill(self, color),
            points: { show: false },
          };
        });
        this.byStatusSettings = {
          title: 'Statuses',
          showLegend: true,
          xValues: xLabels,
          series: series,
          yScaleUnit: '/ h',
          axes: [
            {
              size: this.CHART_LEGEND_SIZE,
              label: 'Total',
              labelSize: 24,
              stroke: '#bfcbec',
              scale: 'total',
              values: (u, vals, space) => vals.map((v) => TimeSeriesUtils.formatAxisValue(v) + '/h'),
            },
          ],
        };
      })
    );
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
                responseTimeData.push(this.selectedMetric.mapFunction(b));
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

          this.throughputChartSettings = {
            title: 'Throughput',
            xValues: timeLabels,
            showLegend: false,
            zScaleTooltipLabel: 'Total Hits/h',
            series: [
              {
                scale: 'total',
                label: 'Total',
                id: 'secondary',
                data: totalThroughput,
                value: (x, v) => Math.trunc(v) + ' total',
                // stroke: '#E24D42',
                fill: (self: uPlot) => UPlotUtils.gradientFill(self, '#8394C9'),
                // fill: 'rgba(255,212,166,0.64)',
                // points: {show: false},
                // drawStyle: 1,
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

          this.responseTypeByKeywordsSettings = {
            title: TimeSeriesConfig.RESPONSE_TIME_CHART_TITLE + ` (${this.selectedMetric.label})`,
            xValues: timeLabels,
            showLegend: false,
            series: responseTimeSeries,
            yScaleUnit: 'ms',
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

  updateTable(): Observable<TimeSeriesChartResponse> {
    if (!this.tableChart) {
      throw 'Table does not exist yet';
    }
    let newRange = this.executionContext.timeSelectionState.getActiveSelection().absoluteSelection;
    if (!newRange) {
      // we have a full selection
      return this.tableChart.refresh(this.findRequest); // refresh the table
    }
    // we make a clone in order to not pollute the global request, since we change from and to params
    let clonedRequest = JSON.parse(JSON.stringify(this.findRequest));
    if (newRange.from) {
      clonedRequest.start = Math.trunc(newRange.from);
    }
    if (newRange.to) {
      clonedRequest.end = Math.trunc(newRange.to);
    }
    return this.tableChart.refresh(clonedRequest); // refresh the table
  }

  handleZoomReset() {
    // TODO uncomment these when the uplot sync feature is removed
    // this.responseTimeChart.resetZoom();
    // this.byStatusChart.resetZoom();
    // this.byStatusChart.resetZoom();
    // this.summaryChart.resetZoom();
    // this.throughputChart.resetZoom();
    this.updateTable().subscribe();
  }

  switchChartMetric(metric: { label: string; mapFunction: (b: Bucket) => number }) {
    this.responseTimeChart.setTitle(TimeSeriesConfig.RESPONSE_TIME_CHART_TITLE + ` (${metric.label})`);
    if (metric.label === this.selectedMetric.label) {
      // it is a real change
      return;
    }
    if (!this.byKeywordsChartResponseCache) {
      return;
    }
    this.selectedMetric = metric;
    let data = this.responseTimeChart.getData();
    this.byKeywordsChartResponseCache.matrix.map((bucketArray, i) => {
      data[i + 1] = bucketArray.map((b) => this.selectedMetric.mapFunction(b));
    });
    this.responseTimeChart.setData(data, false);
  }

  getSeriesKey(attributes: BucketAttributes, groupDimensions: string[]) {
    return groupDimensions
      .map((field) => attributes[field])
      .filter((f) => !!f)
      .join(' | ');
  }

  ngOnDestroy(): void {
    this.subscriptionsTerminator$.next();
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
