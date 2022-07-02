import { Component, ElementRef, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { TSChartSeries, TSChartSettings } from '../chart/model/ts-chart-settings';
import { TimeSeriesService } from '../time-series.service';
import { TSRangerSettings } from '../ranger/ts-ranger-settings';
import { FindBucketsRequest } from '../find-buckets-request';
import { TimeseriesColorsPool } from '../util/timeseries-colors-pool';
import { Bucket } from '../bucket';
import { TimeSeriesChartComponent } from '../chart/time-series-chart.component';
import { KeyValue } from '@angular/common';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TSRangerComponent } from '../ranger/ts-ranger.component';
import { UPlotUtils } from '../uplot/uPlot.utils';
import { TimeSeriesConfig } from '../time-series.config';
import { TimeseriesTableComponent } from './table/timeseries-table.component';
import { Subscription } from 'rxjs';

declare const uPlot: any;

@Component({
  selector: 'step-execution-page',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit, OnDestroy {
  private RESOLUTION_MS = 1000;
  syncKey = 'test';
  executionId = window.location.href.split('/').slice(-1)[0]; // last part of URL

  chart1Settings: TSChartSettings = { title: 'empty', xValues: [], series: [] };
  chart2Settings: TSChartSettings = { title: 'empty', xValues: [], series: [] };
  chart3Settings: TSChartSettings = { title: 'empty', xValues: [], series: [] };
  chart4Settings: TSChartSettings = { title: 'empty', xValues: [], series: [] };
  responseTypeByKeywordsSettings: TSChartSettings = { title: 'empty', xValues: [], series: [] };
  chart6Settings: TSChartSettings = { title: 'empty', xValues: [], series: [] };
  rangerSettings: TSRangerSettings = { xValues: [], series: [] };

  @ViewChild('ranger') ranger!: TSRangerComponent;
  @ViewChild('chart4') throughputByKeywordsChart!: TimeSeriesChartComponent;
  @ViewChild('chart5') responseTimeByKeywordsChart!: TimeSeriesChartComponent;
  @ViewChild('tableChart') tableChart!: TimeseriesTableComponent;

  colorsPool = new TimeseriesColorsPool();

  barsFunction = uPlot.paths.bars;
  stepped = uPlot.paths.stepped;

  keywords: { [key: string]: { isSelected: boolean; color: string } } = {};
  keywordSearchValue: string = '';

  findRequest: FindBucketsRequest = {
    start: 0,
    end: -1,
    intervalSize: 2500,
    params: { eId: this.executionId },
  };

  executionStart: number = 0;
  executionInProgress = false;

  subscriptions: Subscription = new Subscription();
  intervalExecution: any;
  intervalShouldBeCanceled = false;

  // @ts-ignore
  paths = (u, seriesIdx: number, idx0: number, idx1: number, extendGap, buildClip) => {
    return this.barsFunction(u, seriesIdx, idx0, idx1, extendGap, buildClip);
  };

  valueAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.key.localeCompare(b.key);
  };

  onKeywordToggle(keyword: string) {
    this.throughputByKeywordsChart.toggleSeries(keyword);
    this.responseTimeByKeywordsChart.toggleSeries(keyword);
    // let filteredSource: Bucket[] = [];
    // this.tableDataSource.forEach(e => {
    //     if (this.keywords[e.attributes.name].isSelected) {
    //         filteredSource.push(e);
    //     }
    // });
    // this.tableDataSource = filteredSource;
  }

  onKeywordsFetched(keywords: string[]) {
    keywords.forEach((keyword) => {
      let existingKeyword = this.keywords[keyword];
      if (existingKeyword) {
        // don't override existing keywords
        return;
      }
      this.keywords[keyword] = { isSelected: true, color: this.colorsPool.getColor(keyword) };
    });
  }

  constructor(private timeSeriesService: TimeSeriesService) {}

  ngOnInit(): void {
    this.timeSeriesService.getExecutionDetails(this.executionId).subscribe((details) => {
      this.findRequest.start = details.startTime - (details.startTime % this.RESOLUTION_MS);
      this.executionStart = this.findRequest.start;
      let endTime = details.endTime;
      let executionInProgress = details.status === 'RUNNING';
      if (executionInProgress) {
        // we have no end
        endTime = new Date().getTime();
        this.findRequest.end = endTime - (endTime % this.RESOLUTION_MS) - 1;
      } else {
        this.findRequest.end = endTime + (this.RESOLUTION_MS - (endTime % this.RESOLUTION_MS));
      }
      this.executionInProgress = executionInProgress;

      // this.createRanger(this.findRequest);
      this.createSummaryChart(this.findRequest);
      this.tableChart.init(this.findRequest);
      // this.createByStatusChart(this.findRequest);
      this.createByKeywordsCharts(this.findRequest);
      // this.createThreadGroupsChart(this.findRequest);
      if (executionInProgress) {
        this.intervalExecution = setInterval(() => {
          if (this.intervalShouldBeCanceled) {
            clearTimeout(this.intervalExecution);
          }
          let now = new Date().getTime();
          let lastEnd = this.findRequest.end;
          this.findRequest.start = lastEnd - ((lastEnd - this.executionStart) % this.findRequest.intervalSize);
          this.findRequest.end = now;
          this.tableChart.accumulateData(this.findRequest);
          this.updateByKeywordsCharts();
          this.timeSeriesService.getExecutionDetails(this.executionId).subscribe((details) => {
            if (details.endTime) {
              this.intervalShouldBeCanceled = true;
            }
          });
        }, 5000);
      }
    });
  }

  updateByKeywordsCharts() {
    let dimensionKey = 'name';
    this.timeSeriesService
      .fetchBucketsNew({ ...this.findRequest, groupDimensions: [dimensionKey] })
      .subscribe((response) => {
        let timeLabels = this.createTimeLabels(
          this.throughputByKeywordsChart.getLastTimestamp(),
          response.end,
          response.interval
        );
        this.throughputByKeywordsChart.removeTail();
        this.responseTimeByKeywordsChart.removeTail();
        this.throughputByKeywordsChart.addData(timeLabels, 0); // we add new time labels
        this.responseTimeByKeywordsChart.addData(timeLabels, 0); // we add new time labels
        console.log(this.throughputByKeywordsChart.uplot.data[0]);
        let totalData: number[] = Array(response.matrix[0].length); // TODO handle empty response
        response.matrixKeys.map((attributes, i) => {
          let key = attributes[dimensionKey];
          let avgData: number[] = [];
          let countData = response.matrix[i].map((b, j) => {
            let bucketValue = b?.count;
            if (totalData[j] == undefined) {
              totalData[j] = bucketValue;
            } else if (bucketValue) {
              totalData[j] += bucketValue;
            }
            if (b) {
              avgData.push(b.sum / b.count);
            }
            return bucketValue;
          });
          if (this.throughputByKeywordsChart.hasSeries(key)) {
            this.throughputByKeywordsChart.addDataByKey(countData, key);
            this.responseTimeByKeywordsChart.addDataByKey(avgData, key);
          } else {
            // we are dealing with a new series
            let color = this.colorsPool.getColor(key);
            let newSeries = {
              scale: '1',
              label: attributes,
              id: attributes,
              data: countData,
              value: (x, v) => Math.trunc(v) + ' hits',
              stroke: color,
              points: { show: false },
            } as TSChartSeries;
            this.throughputByKeywordsChart.addSeries(newSeries);
            this.responseTimeByKeywordsChart.addSeries(newSeries);
          }
          this.throughputByKeywordsChart.addDataByKey(totalData, 'secondary');
        });
        this.throughputByKeywordsChart.redraw();
      });
  }

  onZoomReset() {
    this.ranger.resetSelect(); // this will trigger a range change event
  }

  createThreadGroupsChart(request: FindBucketsRequest) {
    let dimensionKey = 'name';
    this.timeSeriesService
      .fetchBucketsNew({ ...request, threadGroupBuckets: true, groupDimensions: [dimensionKey] })
      .subscribe((response) => {
        let timeLabels = this.createTimeLabels(response.start, response.end, response.interval);
        if (response.matrix.length === 0) {
          return; // TODO handle
        }
        let totalData: number[] = Array(response.matrix[0].length);
        let countSeries = [];
        let series = response.matrixKeys.map((key, i) => {
          key = key[dimensionKey]; // get just the name
          let countData = response.matrix[i].map((b, j) => {
            let bucketValue = b?.sum;
            if (totalData[j] === undefined) {
              totalData[j] = bucketValue;
            } else if (bucketValue) {
              totalData[j] += bucketValue;
            }
            return bucketValue;
          });
          let series = {
            scale: '1',
            label: key,
            id: key,
            data: countData,
            value: (x, v) => Math.trunc(v),
            stroke: '#024981',
            width: 2,
            paths: this.stepped({ align: 1 }),
            points: { show: false },
          } as TSChartSeries;
          countSeries.push(series);
          return series;
        });
        console.log(series);
        console.log(totalData);
        this.chart6Settings = {
          title: 'Thread Groups (Concurrency)',
          xValues: timeLabels,
          showLegend: true,
          cursor: {
            dataIdx: UPlotUtils.closestNotEmptyPointFunction,
          },
          series: [
            {
              id: 'total',
              scale: '2',
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
            ...series,
          ],
          axes: [
            {
              scale: '1',
              values: (u, vals, space) => vals.map((v) => +v.toFixed(0)),
            },
            {
              side: 1,
              // size: 60,
              scale: '2',
              values: (u, vals, space) => vals.map((v) => +v.toFixed(0)),
              grid: { show: false },
            },
          ],
        };
      });
  }

  createRanger(request: FindBucketsRequest) {
    this.timeSeriesService.fetchBucketsNew(request).subscribe((response) => {
      let timeLabels = this.createTimeLabels(response.start, response.end, response.interval);
      console.log('TIME: ', response.start, response.end);
      let avgData = response.matrix[0].map((b) => (b ? b.sum / b.count : null));
      this.rangerSettings = {
        xValues: timeLabels,
        series: [
          {
            id: 'avg',
            label: 'Response Time',
            data: avgData,
            // value: (self, x) => Math.trunc(x) + ' ms',
            stroke: 'red',
          },
        ],
      };
    });
  }

  createSummaryChart(request: FindBucketsRequest) {
    this.timeSeriesService.fetchBucketsNew(request).subscribe((response) => {
      let xLabels = this.createTimeLabels(response.start, response.end, response.interval);
      let avgValues: (number | null)[] = [];
      let countValues: (number | null)[] = [];
      if (response.matrix.length === 0) {
        return; // TODO handle
      }
      response.matrix[0].forEach((bucket) => {
        avgValues.push(bucket ? bucket.sum / bucket.count : null);
        countValues.push(bucket?.count);
      });
      this.chart1Settings = {
        title: 'Average Response Time',
        showLegend: true,
        xValues: xLabels,
        series: [
          {
            id: 'count',
            scale: '2',
            label: 'Hits/sec',
            data: countValues,
            value: (x, v) => Math.trunc(v) + ' hits',
            fill: 'rgba(255,124,18,0.2)',
            points: { show: false },
          },
          {
            id: 'avg',
            scale: '1',
            label: 'Response Time',
            data: avgValues,
            value: (x, v) => Math.trunc(v) + ' ms',
            stroke: 'rgba(0,117,187,0.41)',
            fill: (self, idx) => {
              let gradient = self.ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(49,116,197,0.73)');
              gradient.addColorStop(1, '#ff000006');
              return gradient;
            },
          },
        ],
        axes: [
          {
            scale: '1',
            values: (u, vals, space) => vals.map((v) => +v.toFixed(2) + ' ms'),
          },
          {
            side: 1,
            // size: 60,
            scale: '2',
            values: (u, vals, space) => vals.map((v) => +v.toFixed(2) + ' hits'),
            grid: { show: false },
          },
        ],
        autoResize: true,
      };
    });
  }

  createByStatusChart(request: FindBucketsRequest) {
    this.timeSeriesService.fetchBucketsNew({ ...request, groupDimensions: ['rnStatus'] }).subscribe((response) => {
      let xLabels = this.createTimeLabels(response.start, response.end, response.interval);
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
      this.chart3Settings = {
        title: 'Keyword Statuses',
        showLegend: true,
        xValues: xLabels,
        series: series,
        axes: [
          {
            values: (u, vals, space) => vals.map((v) => Math.trunc(v)),
          },
        ],
      };
    });
  }

  createByKeywordsCharts(request: FindBucketsRequest) {
    let dimensionKey = 'name';
    this.timeSeriesService.fetchBucketsNew({ ...request, groupDimensions: [dimensionKey] }).subscribe((response) => {
      let timeLabels = this.createTimeLabels(response.start, response.end, response.interval);
      let totalData: number[] = Array(response.matrix[0].length); // TODO handle empty response
      let avgSeries: TSChartSeries[] = [];
      let countSeries = [];
      let series = response.matrixKeys.map((key, i) => {
        key = key[dimensionKey];
        let avgSeriesData: number[] = [];
        let color = this.colorsPool.getColor(key);
        let countData = response.matrix[i].map((b, j) => {
          let bucketValue = b?.count;
          if (totalData[j] == undefined) {
            totalData[j] = bucketValue;
          } else if (bucketValue) {
            totalData[j] += bucketValue;
          }
          if (b) {
            avgSeriesData.push(b.sum / b.count);
          }
          return bucketValue;
        });
        let series = {
          scale: '1',
          label: key,
          id: key,
          data: countData,
          value: (x, v) => Math.trunc(v) + ' hits',
          stroke: color,
          points: { show: false },
        } as TSChartSeries;
        countSeries.push(series);
        avgSeries.push({ ...series, data: avgSeriesData });
        return series;
      });

      this.chart4Settings = {
        title: 'Throughput by keywords',
        xValues: timeLabels,
        showLegend: false,
        series: [
          {
            scale: '2',
            label: 'Total',
            id: 'secondary',
            data: totalData,
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
          ...series,
        ],
        axes: [
          {
            scale: '1',
            values: (u, vals, space) => vals.map((v) => +v.toFixed(2) + ' hits'),
          },
          {
            side: 1,
            // size: 60,
            scale: '2',
            values: (u, vals, space) => vals.map((v) => +v.toFixed(2) + ' hits'),
            grid: { show: false },
          },
        ],
      };

      this.responseTypeByKeywordsSettings = {
        title: 'Response time by keywords',
        xValues: timeLabels,
        showLegend: false,
        series: avgSeries,
        axes: [
          {
            scale: '1',
            values: (u, vals, space) => vals.map((v) => +v.toFixed(2) + ' hits'),
          },
        ],
      };
    });
  }

  onRangeChange(newRange: TSTimeRange) {
    this.findRequest.start = Math.trunc(newRange.start);
    this.findRequest.end = Math.trunc(newRange.end);
    this.tableChart.init(this.findRequest);
  }

  createTimeLabels(start: number, end: number, interval: number): number[] {
    let intervals = Math.ceil((end - start) / interval);
    const result = Array(intervals);
    for (let i = 0; i < intervals; i++) {
      result[i] = start + i * interval; //
    }
    // result[intervals] = result[intervals - 1] + TimeSeriesConfig.RESOLUTION; // we add one second as a small padding

    return result;
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalExecution);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
