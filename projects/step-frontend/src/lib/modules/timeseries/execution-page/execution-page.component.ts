import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { TSChartSeries, TSChartSettings } from '../chart/model/ts-chart-settings';
import { TimeSeriesService } from '../time-series.service';
import { FindBucketsRequest } from '../find-buckets-request';
import { TimeseriesColorsPool } from '../util/timeseries-colors-pool';
import { TimeSeriesChartComponent } from '../chart/time-series-chart.component';
import { KeyValue } from '@angular/common';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TSRangerComponent } from '../ranger/ts-ranger.component';
import { UPlotUtils } from '../uplot/uPlot.utils';
import { TimeSeriesConfig } from '../time-series.config';
import { TimeseriesTableComponent } from './table/timeseries-table.component';
import { Subscription } from 'rxjs';
import { TimeSeriesUtils } from '../time-series-utils';
import { ExecutionPageTimeSelectionComponent } from './time-selection/execution-page-time-selection.component';
import { ExecutionTabContext } from './execution-tab-context';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { KeywordSelection, TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { Bucket } from '../bucket';
import { TimeSeriesChartResponse } from '../time-series-chart-response';
import { ExecutionsPageService } from '../executions-page.service';

declare const uPlot: any;

@Component({
  selector: 'step-execution-page',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit, OnDestroy {
  private RESOLUTION_MS = 1000;
  private LEGEND_SIZE = 65;

  summaryChartSettings: TSChartSettings | undefined;
  byStatusSettings: TSChartSettings | undefined;
  throughputChartSettings: TSChartSettings | undefined;
  responseTypeByKeywordsSettings: TSChartSettings | undefined;
  threadGroupSettings: TSChartSettings | undefined;
  rangerSettings: TSChartSettings | undefined;

  @ViewChild('ranger') ranger!: TSRangerComponent;
  @ViewChild('chart4') throughputByKeywordsChart!: TimeSeriesChartComponent;
  @ViewChild('summaryChart') summaryChart!: TimeSeriesChartComponent;
  @ViewChild('byStatusChart') byStatusChart!: TimeSeriesChartComponent;
  @ViewChild('chart5') responseTimeByKeywordsChart!: TimeSeriesChartComponent;
  @ViewChild('threadGroupChart') threadGroupChart!: TimeSeriesChartComponent;
  @ViewChild('tableChart') tableChart!: TimeseriesTableComponent;

  @ViewChild(ExecutionPageTimeSelectionComponent) timeSelectionComponent!: ExecutionPageTimeSelectionComponent;

  @Input('executionId') executionId!: string;

  barsFunction = uPlot.paths.bars;
  stepped = uPlot.paths.stepped;

  keywords: { [key: string]: KeywordSelection } = {};
  keywordSearchValue: string = '';

  byKeywordsChartResponseCache?: TimeSeriesChartResponse; // for caching

  findRequest!: FindBucketsRequest;

  execution: any;
  executionStart: number = 0;
  executionInProgress = false;
  refreshEnabled = false;
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

  subscriptions: Subscription = new Subscription();
  intervalExecution: any;
  intervalShouldBeCanceled = false;

  allSeriesChecked: boolean = true;

  private colorsPool = new TimeseriesColorsPool();
  private keywordsService!: TimeSeriesKeywordsContext;

  responseTimeMetrics = [
    { label: 'AVG', mapping: (b: Bucket) => b.sum / b.throughputPerHour },
    { label: 'MIN', mapping: (b: Bucket) => b.min },
    { label: 'MAX', mapping: (b: Bucket) => b.max },
    { label: 'Perc. 90', mapping: (b: Bucket) => b.pclValues[90] },
    { label: 'Perc. 99', mapping: (b: Bucket) => b.pclValues[99] },
  ];
  selectedMetric = this.responseTimeMetrics[0];

  private executionService!: ExecutionTabContext;

  valueAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.key.localeCompare(b.key);
  };

  constructor(private timeSeriesService: TimeSeriesService, private executionsPageService: ExecutionsPageService) {}

  onAllSeriesCheckboxClick(event: any) {
    this.keywordsService.toggleSelectAll();
  }

  changeRefreshInterval(newInterval: RefreshInterval) {
    if (newInterval.value) {
      if (this.selectedRefreshInterval.value === newInterval.value) {
        return;
      }
      this.refreshEnabled = true;
      clearInterval(this.intervalExecution);
      this.startRefreshInterval(newInterval.value);
    } else {
      // we need to stop it
      this.refreshEnabled = false;
      clearInterval(this.intervalExecution);
    }
    this.selectedRefreshInterval = newInterval;
  }

  ngOnInit(): void {
    this.initContext();
    this.keywordsService.onAllSelectionChanged().subscribe((selected) => {
      this.allSeriesChecked = selected;
    });
    this.keywordsService.onKeywordToggled().subscribe((selection) => {
      this.throughputByKeywordsChart.toggleSeries(selection.id);
      this.responseTimeByKeywordsChart.toggleSeries(selection.id);
      this.keywords[selection.id] = selection;
    });
    this.keywordsService.onKeywordsUpdated().subscribe((keywords) => {
      this.keywords = keywords;
    });
    this.executionService.onActiveSelectionChange().subscribe((newRange) => (this.timeSelection = newRange));

    this.timeSeriesService.getExecutionDetails(this.executionId).subscribe((details) => {
      this.executionService.activeExecution = details;
      this.execution = details;
      let startTime = details.startTime - (details.startTime % this.RESOLUTION_MS);
      this.findRequest.start = startTime;
      this.executionStart = this.findRequest.start;
      // let now = new Date().getTime();
      let endTime = details.endTime;
      if (endTime) {
        // execution is over
        endTime = endTime + (this.RESOLUTION_MS - (endTime % this.RESOLUTION_MS)); // not sure if needed
      } else {
        this.executionInProgress = true;
        endTime = new Date().getTime();
      }
      this.findRequest.end = endTime;
      // this.findRequest.intervalSize = this.computeIntervalSize(this.findRequest.start, this.findRequest.end);
      this.findRequest.numberOfBuckets = this.calculateIdealNumberOfBuckets(startTime, endTime);
      this.createSummaryChart(this.findRequest);
      if (this.tableChart) this.tableChart.init(this.findRequest);
      this.createByStatusChart(this.findRequest);
      this.createByKeywordsCharts(this.findRequest);
      this.createThreadGroupsChart(this.findRequest);

      if (this.executionInProgress) {
        this.startRefreshInterval(this.selectedRefreshInterval.value);
        this.refreshEnabled = true;
      }
    });
  }

  private initContext() {
    if (!this.executionId) {
      throw new Error('Execution id is not specified!');
    }
    this.findRequest = {
      start: 0,
      end: -1,
      intervalSize: 2500,
      params: { eId: this.executionId },
    };
    this.executionService = this.executionsPageService.getContext(this.executionId);
    this.keywordsService = this.executionService.getKeywordsContext();
  }

  startRefreshInterval(interval: number) {
    this.intervalExecution = setInterval(() => {
      if (this.intervalShouldBeCanceled) {
        clearTimeout(this.intervalExecution);
      }
      let now = new Date().getTime();
      // this.findRequest.start = lastEnd - ((lastEnd - this.executionStart) % this.findRequest.intervalSize);
      this.findRequest.end = now;
      if (this.timeSelection.type === RangeSelectionType.RELATIVE && this.timeSelection.relativeSelection) {
        let from = now - this.timeSelection.relativeSelection.timeInMs;
        this.timeSelection.absoluteSelection = { from: from, to: now };
      }
      this.findRequest.numberOfBuckets = this.calculateIdealNumberOfBuckets(
        this.findRequest.start,
        this.findRequest.end
      );
      // this.tableChart.accumulateData(this.findRequest);
      // this.updateByKeywordsCharts();
      this.timeSelectionComponent.refreshRanger();
      // if (this.timeSelection.type === RangeSelectionType.FULL) {
      //   this.timeSelection.absoluteSelection = undefined;
      // } else if (this.timeSelection.type === RangeSelectionType.RELATIVE && this.timeSelection.relativeSelection) {
      //   let endTime = this.execution.endTime || new Date().getTime();
      //   let from = endTime - this.timeSelection.relativeSelection.timeInMs;
      //   this.timeSelection.absoluteSelection = { from, to: endTime };
      // }
      // this.executionService.setActiveSelection(this.timeSelection);
      this.recreateAllCharts();
      this.timeSeriesService.getExecutionDetails(this.executionId).subscribe((details) => {
        if (details.endTime) {
          this.intervalShouldBeCanceled = true;
        }
      });
    }, interval);
  }

  recreateAllCharts() {
    this.createSummaryChart(this.findRequest, true);
    this.tableChart.init(this.findRequest);
    this.createByStatusChart(this.findRequest, true);
    this.createByKeywordsCharts(this.findRequest, true);
    this.createThreadGroupsChart(this.findRequest, true);
  }

  onKeywordToggle(keyword: string, event: any) {
    this.keywordsService.toggleKeyword(keyword);

    // let filteredSource: Bucket[] = [];
    // this.tableDataSource.forEach(e => {
    //     if (this.keywords[e.attributes.name].isSelected) {
    //         filteredSource.push(e);
    //     }
    // });
    // this.tableDataSource = filteredSource;
  }

  // onKeywordsFetched(keywords: string[]) {
  //   keywords.forEach((keyword) => {
  //     let existingKeyword = this.keywords[keyword];
  //     if (existingKeyword) {
  //       // don't override existing keywords
  //       return;
  //     }
  //     this.keywords[keyword] = { isSelected: true, color: this.colorsPool.getColor(keyword) };
  //   });
  // }

  // updateByKeywordsCharts() {
  //   let dimensionKey = 'name';
  //   this.timeSeriesService.fetchBucketsNew({ ...this.findRequest, groupDimensions: [dimensionKey] }).subscribe((response) => {
  //     let timeLabels = this.createTimeLabels(response.start, response.end, response.interval);
  //     let totalData: number[] = Array(response.matrix[0].length); // TODO handle empty response
  //     let avgSeries: TSChartSeries[] = [];
  //     let countSeries = [];
  //     let series = response.matrixKeys.map((key, i) => {
  //       key = key[dimensionKey];
  //       let avgSeriesData: number[] = [];
  //       let color = this.colorsPool.getColor(key);
  //       let countData = response.matrix[i].map((b, j) => {
  //         let bucketValue = b?.count;
  //         if (totalData[j] == undefined) {
  //           totalData[j] = bucketValue;
  //         } else if (bucketValue) {
  //           totalData[j] += bucketValue;
  //         }
  //         if (b) {
  //           avgSeriesData.push(b.sum / b.count);
  //         }
  //         return bucketValue;
  //       });
  //       let series = {
  //         scale: 'y',
  //         label: key,
  //         id: key,
  //         data: countData,
  //         value: (x, v) => Math.trunc(v),
  //         stroke: color,
  //         points: { show: false },
  //       } as TSChartSeries;
  //       countSeries.push(series);
  //       avgSeries.push({ ...series, data: avgSeriesData });
  //       return series;
  //     });
  //
  //     let allSeries = [
  //       {
  //         scale: 'total',
  //         label: 'Total',
  //         id: 'secondary',
  //         data: totalData,
  //         value: (x: any, v: any) => Math.trunc(v) + ' total',
  //         // stroke: '#E24D42',
  //         fill: 'rgba(143,161,210,0.38)',
  //         // fill: 'rgba(255,212,166,0.64)',
  //         // points: {show: false},
  //         // @ts-ignore
  //         drawStyle: 1,
  //         paths: this.barsFunction({ size: [0.9, 100] }),
  //         points: { show: false },
  //       },
  //       ...series,
  //     ];
  //     // this.throughputChartSettings = {
  //     //   title: 'Throughput by keywords',
  //     //   xValues: timeLabels,
  //     //   showLegend: false,
  //     //   series: allSeries,
  //     //   axes: [
  //     //     {
  //     //       scale: 'y',
  //     //       values: (u, vals, space) => vals.map((v) => +v.toFixed(2)),
  //     //     },
  //     //     {
  //     //       side: 1,
  //     //       // size: 60,
  //     //       scale: 'total',
  //     //       values: (u, vals, space) => vals.map((v) => +v.toFixed(2)),
  //     //       grid: { show: false },
  //     //     },
  //     //   ],
  //     // };
  //     //
  //     // this.responseTypeByKeywordsSettings = {
  //     //   title: 'Response time by keywords',
  //     //   xValues: timeLabels,
  //     //   showLegend: false,
  //     //   series: avgSeries,
  //     //   axes: [
  //     //     {
  //     //       scale: 'y',
  //     //       values: (u, vals, space) => vals.map((v) => +v.toFixed(2)),
  //     //     },
  //     //   ],
  //     // };
  //     this.responseTimeByKeywordsChart.updateFullData(allSeries);
  //   });
  // }

  // updateByKeywordsCharts() {
  //   let dimensionKey = 'name';
  //   this.timeSeriesService
  //     .fetchBucketsNew({ ...this.findRequest, groupDimensions: [dimensionKey] })
  //     .subscribe((response) => {
  //       let timeLabels = this.createTimeLabels(
  //         this.throughputByKeywordsChart.getLastTimestamp(),
  //         response.end,
  //         response.interval
  //       );
  //       this.throughputByKeywordsChart.removeTail();
  //       this.responseTimeByKeywordsChart.removeTail();
  //       this.throughputByKeywordsChart.addData(timeLabels, 0); // we add new time labels
  //       this.responseTimeByKeywordsChart.addData(timeLabels, 0); // we add new time labels
  //       console.log(this.throughputByKeywordsChart.uplot.data[0]);
  //       let totalData: number[] = Array(response.matrix[0].length); // TODO handle empty response
  //       response.matrixKeys.map((attributes, i) => {
  //         let key = attributes[dimensionKey];
  //         let avgData: number[] = [];
  //         let countData = response.matrix[i].map((b, j) => {
  //           let bucketValue = b?.count;
  //           if (totalData[j] == undefined) {
  //             totalData[j] = bucketValue;
  //           } else if (bucketValue) {
  //             totalData[j] += bucketValue;
  //           }
  //           if (b) {
  //             avgData.push(b.sum / b.count);
  //           }
  //           return bucketValue;
  //         });
  //         if (this.throughputByKeywordsChart.hasSeries(key)) {
  //           this.throughputByKeywordsChart.addDataByKey(countData, key);
  //           this.responseTimeByKeywordsChart.addDataByKey(avgData, key);
  //         } else {
  //           // we are dealing with a new series
  //           let color = this.colorsPool.getColor(key);
  //           let newSeries = {
  //             scale: '1',
  //             label: attributes,
  //             id: attributes,
  //             data: countData,
  //             value: (x, v) => Math.trunc(v),
  //             stroke: color,
  //             points: { show: false },
  //           } as TSChartSeries;
  //           this.throughputByKeywordsChart.addSeries(newSeries);
  //           this.responseTimeByKeywordsChart.addSeries(newSeries);
  //         }
  //         this.throughputByKeywordsChart.addDataByKey(totalData, 'secondary');
  //       });
  //       this.throughputByKeywordsChart.redraw();
  //     });
  // }

  onZoomReset() {
    this.timeSelectionComponent.resetZoom();
  }

  createThreadGroupsChart(request: FindBucketsRequest, isUpdate = false) {
    let dimensionKey = 'name';
    this.timeSeriesService
      .fetchBucketsNew({ ...request, threadGroupBuckets: true, groupDimensions: [dimensionKey] })
      .subscribe((response) => {
        let timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
        if (response.matrix.length === 0) {
          return; // TODO handle
        }
        let totalData: number[] = Array(response.matrix[0].length);
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
              fill: 'rgba(143,161,210,0.38)',
              // fill: 'rgba(255,212,166,0.64)',
              // points: {show: false},
              // @ts-ignore
              // drawStyle: 1,
              paths: this.stepped({ align: 1 }),
              points: { show: false },
            },
            ...dynamicSeries,
          ],
          axes: [
            {
              scale: 'y',
              size: this.LEGEND_SIZE,
              values: (u, vals, space) => vals.map((v) => v),
            },
            {
              side: 1,
              size: this.LEGEND_SIZE,
              scale: 'total',
              values: (u, vals, space) => vals.map((v) => v),
              grid: { show: false },
            },
          ],
        };
        if (isUpdate) {
          this.threadGroupChart.redrawChart(this.threadGroupSettings);
        }
      });
  }

  createSummaryChart(request: FindBucketsRequest, isUpdate = false) {
    this.timeSeriesService.fetchBucketsNew(request).subscribe((response) => {
      let xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
      let avgValues: (number | null)[] = [];
      let countValues: (number | null)[] = [];
      if (response.matrix.length === 0) {
        return; // TODO handle
      }
      response.matrix[0].forEach((bucket) => {
        avgValues.push(bucket ? bucket.sum / bucket.count : null);
        countValues.push(bucket?.throughputPerHour);
      });
      this.summaryChartSettings = {
        title: 'Average Response Time',
        showLegend: true,
        xValues: xLabels,
        yScaleUnit: 'ms',
        series: [
          {
            id: 'avg',
            scale: 'y',
            label: 'Response Time',
            data: avgValues,
            value: (x, v) => Math.trunc(v) + ' ms',
            // stroke: 'rgba(0,117,187,0.41)',
            // fill: (self, idx) => {
            //   let gradient = self.ctx.createLinearGradient(0, 0, 0, 400);
            //   gradient.addColorStop(0, 'rgba(49,116,197,0.73)');
            //   gradient.addColorStop(1, '#ff000006');
            //   return gradient;
            // },
            fill: 'rgba(143,161,210,0.38)',
            paths: this.barsFunction({ size: [0.9, 100] }),
            points: { show: false },
          },
          {
            id: 'count',
            scale: 'total',
            label: 'Hits/h',
            data: countValues,
            value: (x, v) => Math.trunc(v),
            fill: 'rgba(255,124,18,0.4)',
            points: { show: false },
          },
        ],
        axes: [
          {
            scale: 'y',
            size: this.LEGEND_SIZE,
            values: (u, vals, space) => vals.map((v) => UPlotUtils.formatMilliseconds(v)),
          },
          {
            side: 1,
            size: this.LEGEND_SIZE,
            scale: 'total',
            values: (u, vals, space) => vals.map((v) => this.formatAxisValue(v)),
            grid: { show: false },
          },
        ],
        autoResize: true,
      };
      if (isUpdate && this.byStatusChart) {
        this.summaryChart.redrawChart(this.summaryChartSettings);
      }
    });
  }

  createByStatusChart(request: FindBucketsRequest, isUpdate = false) {
    this.timeSeriesService.fetchBucketsNew({ ...request, groupDimensions: ['rnStatus'] }).subscribe((response) => {
      let xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
      let series: TSChartSeries[] = response.matrix.map((series, i) => {
        let status = response.matrixKeys[i]['rnStatus'];
        let color = this.colorsPool.getStatusColor(status);
        return {
          id: status,
          label: status,
          data: series.map((b) => (b ? b.count : null)),
          // scale: 'mb',
          // value: (self, x) => Math.trunc(x) + ' ms',
          stroke: color,
          fill: color + '20',
        };
      });
      this.byStatusSettings = {
        title: 'Keyword Statuses',
        showLegend: true,
        xValues: xLabels,
        series: series,
        axes: [
          {
            size: this.LEGEND_SIZE,
            values: (u, vals, space) => vals.map((v) => this.formatAxisValue(v)),
          },
        ],
      };
      if (isUpdate && this.byStatusChart) {
        this.byStatusChart.redrawChart(this.byStatusSettings);
      }
    });
  }

  createByKeywordsCharts(request: FindBucketsRequest, isUpdate = false) {
    let dimensionKey = 'name';
    this.timeSeriesService
      .fetchBucketsNew({ ...request, groupDimensions: [dimensionKey], percentiles: [90, 99] })
      .subscribe((response) => {
        this.byKeywordsChartResponseCache = response;
        let timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
        let totalThroughput: number[] = Array(response.matrix[0].length); // TODO handle empty response
        let responseTimeSeries: TSChartSeries[] = [];
        let throughputSeries: TSChartSeries[] = [];
        response.matrixKeys.map((key, i) => {
          key = key[dimensionKey];
          let responseTimeData: number[] = [];
          let color = this.colorsPool.getColor(key);
          let countData = response.matrix[i].map((b, j) => {
            let bucketValue = b?.throughputPerHour;
            if (totalThroughput[j] == undefined) {
              totalThroughput[j] = bucketValue;
            } else if (bucketValue) {
              totalThroughput[j] += bucketValue;
            }
            if (b) {
              responseTimeData.push(this.selectedMetric.mapping(b));
            }
            return bucketValue;
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
          title: 'Throughput by keywords / h',
          xValues: timeLabels,
          showLegend: false,
          series: [
            {
              scale: 'total',
              label: 'Total',
              id: 'secondary',
              data: totalThroughput,
              value: (x, v) => Math.trunc(v) + ' total',
              // stroke: '#E24D42',
              fill: 'rgba(143,161,210,0.38)',
              // fill: 'rgba(255,212,166,0.64)',
              // points: {show: false},
              // @ts-ignore
              drawStyle: 1,
              paths: this.barsFunction({ size: [0.9, 100] }),
              points: { show: false },
            },
            ...throughputSeries,
          ],
          axes: [
            {
              scale: 'y',
              size: this.LEGEND_SIZE,
              values: (u, vals, space) => vals.map((v) => this.formatAxisValue(v)),
            },
            {
              side: 1,
              size: this.LEGEND_SIZE,
              scale: 'total',
              values: (u, vals, space) => vals.map((v) => this.formatAxisValue(v)),
              grid: { show: false },
            },
          ],
        };

        this.responseTypeByKeywordsSettings = {
          title: 'Response time by keywords',
          xValues: timeLabels,
          showLegend: false,
          series: responseTimeSeries,
          yScaleUnit: 'ms',
          axes: [
            {
              scale: 'y',
              size: this.LEGEND_SIZE,
              values: (u, vals, space) => vals.map((v) => UPlotUtils.formatMilliseconds(v)),
            },
          ],
        };
        if (isUpdate && this.responseTimeByKeywordsChart && this.throughputChartSettings) {
          this.responseTimeByKeywordsChart.redrawChart(this.responseTypeByKeywordsSettings);
          this.throughputByKeywordsChart.redrawChart(this.throughputChartSettings);
        }
      });
  }

  /**
   * If the execution is very short (or just started), we don't want a big number of buckets.
   */
  calculateIdealNumberOfBuckets(startTime: number, endTime: number): number {
    return Math.trunc(
      Math.min(TimeSeriesConfig.MAX_BUCKETS_IN_CHART, (endTime - startTime) / TimeSeriesConfig.RESOLUTION / 2)
    );
  }

  handleTableRangeChange(newRange: TSTimeRange) {
    let clonedRequest = JSON.parse(JSON.stringify(this.findRequest)); // we make a clone in order to not pollute the global request
    if (newRange.from) clonedRequest.start = Math.trunc(newRange.from);
    if (newRange.to) clonedRequest.end = Math.trunc(newRange.to);
    this.tableChart.init(clonedRequest); // refresh the table
  }

  handleRangeReset(newRange: TSTimeRange) {
    this.responseTimeByKeywordsChart.resetZoom();
    this.byStatusChart.resetZoom();
    this.byStatusChart.resetZoom();
    this.summaryChart.resetZoom();
    this.throughputByKeywordsChart.resetZoom();
    this.handleTableRangeChange(newRange);
  }

  switchChartMetric(metric: { label: string; mapping: (b: Bucket) => number }) {
    if (metric.label === this.selectedMetric.label) {
      // it is a real change
      return;
    }
    if (!this.byKeywordsChartResponseCache) {
      return;
    }
    this.selectedMetric = metric;
    let data = this.responseTimeByKeywordsChart.getData();
    this.byKeywordsChartResponseCache.matrix.map((bucketArray, i) => {
      data[i + 1] = bucketArray.map((b) => this.selectedMetric.mapping(b));
    });
    this.responseTimeByKeywordsChart.setData(data, false);
  }

  formatAxisValue(num: number) {
    const lookup = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'k' },
      { value: 1e6, symbol: 'M' },
      { value: 1e9, symbol: 'B' },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return num >= item.value;
      });
    return item ? (num / item.value).toFixed(2).replace(rx, '$1') + item.symbol : '0';
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalExecution);
    this.executionsPageService.destroyContext(this.executionId);
  }
}

interface RefreshInterval {
  label: string;
  value: number; // 0 if it's off
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
