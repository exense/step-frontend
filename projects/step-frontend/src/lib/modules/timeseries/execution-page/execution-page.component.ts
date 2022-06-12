import {Component, ElementRef, OnChanges, OnInit, ViewChild} from "@angular/core";
import {downgradeComponent, getAngularJSGlobal} from '@angular/upgrade/static';
import {AJS_MODULE} from '@exense/step-core';
import {TSChartSeries, TSChartSettings} from '../chart/model/ts-chart-settings';
import {TimeSeriesService} from '../time-series.service';
import {TSRangerSettings} from '../ranger/ts-ranger-settings';
import {FindBucketsRequest} from '../find-buckets-request';
import {SeriesColorsPool} from '../util/series-colors-pool';
import {Bucket} from '../bucket';
import {TimeSeriesChartComponent} from '../chart/time-series-chart.component';
import {KeyValue} from '@angular/common';
import {TSTimeRange} from '../chart/model/ts-time-range';
import {TSRangerComponent} from '../ranger/ts-ranger.component';

declare const uPlot: any;

@Component({
    selector: 'step-execution-page',
    templateUrl: './execution-page.component.html',
    styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit {

    syncKey = 'test';
    executionId = window.location.href.split('/').slice(-1)[0]; // last part of URL

    chart1Settings: TSChartSettings;
    chart2Settings: TSChartSettings;
    chart3Settings: TSChartSettings;
    chart4Settings: TSChartSettings;
    chart5Settings: TSChartSettings;
    rangerSettings: TSRangerSettings;

    @ViewChild('ranger') ranger: TSRangerComponent;
    @ViewChild('chart4') chart4: TimeSeriesChartComponent;
    @ViewChild('chart5') chart5: TimeSeriesChartComponent;

    tableColumns = ['name', 'count', 'sum', 'avg', 'min', 'max'];
    tableDataSource: Bucket[] = [];
    tableIsLoading = true;

    colorsPool = new SeriesColorsPool();

    barsFunction = uPlot.paths.bars;

    keywords: {[key: string]: {isSelected: boolean, color: string}} = {};
    keywordSearchValue: string;

    // @ts-ignore
    paths = (u, seriesIdx: number, idx0: number, idx1: number, extendGap, buildClip) => {
        return this.barsFunction(u, seriesIdx, idx0, idx1, extendGap, buildClip);
    }

    valueAscOrder = (a: KeyValue<string,any>, b: KeyValue<string,any>): number => {
        return a.key.localeCompare(b.key);
    }

    onKeywordToggle(keyword: string) {
        this.chart4.toggleSeries(keyword);
        this.chart5.toggleSeries(keyword);
        // let filteredSource: Bucket[] = [];
        // this.tableDataSource.forEach(e => {
        //     if (this.keywords[e.attributes.name].isSelected) {
        //         filteredSource.push(e);
        //     }
        // });
        // this.tableDataSource = filteredSource;
    }

    constructor(private timeSeriesService: TimeSeriesService) {
    }

    ngOnInit(): void {
        let request: FindBucketsRequest = {
            start: 0,
            end: 9999999999999,
            intervalSize: 2500,
            params: {eId: this.executionId}
        };
        this.timeSeriesService.getExecutionDetails(this.executionId).subscribe(details => {
            request.start = details.startTime;
            request.end = details.endTime + 1;
            this.createTableChart(request);
            this.createByStatusChart(request);
            this.createByMeasurementsCharts(request);
            this.createSummaryChart(request);
            this.createRanger(request);
        });
    }

    onZoomReset() {
        console.log('zoom reset!');
    }

    createRanger(request: FindBucketsRequest) {
        this.timeSeriesService.fetchBuckets(request).subscribe((buckets: any) => {
            let bucketsMap = buckets['{}'];
            let keys = Object.keys(bucketsMap);
            // console.log(keys, bucketsMap);
            // const data = [[1,2,3,4,5,6], [4,5,6,7,8,9]];
            let avgValues: number[] = [];
            let countValues: number[] = [];
            keys.forEach(key => {
                let bucket = bucketsMap[key];
                avgValues.push(bucket.sum / bucket.count);
                countValues.push(bucket.count);
            });
            let keyValues = keys.map(key => parseInt(key) / 1000);

            console.log(keyValues[keyValues.length - 1]);
            this.initRangerSettings(keyValues, avgValues);
        });
    }

    createSummaryChart(request: FindBucketsRequest) {
        this.timeSeriesService.fetchBucketsNew(request).subscribe((response) => {
            let xLabels = this.createTimeLabels(response.start, response.end, response.interval);
            let avgValues: number[] = [];
            let countValues: number[] = [];
            response.matrix[0].forEach(bucket => {
                avgValues.push(bucket ? (bucket.sum / bucket.count) : null);
                countValues.push(bucket?.count);
            });
            this.chart1Settings = {
                title: 'Average Response Time',
                showLegend: true,
                xValues: xLabels,
                series: [
                    {
                        scale: '2',
                        label: 'Hits/sec',
                        data: countValues,
                        value: (x, v) => Math.trunc(v) + ' hits',
                        fill: 'rgba(255,124,18,0.2)',
                        points: {show: false}
                    },
                    {
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
                        }
                    },

                ],
                axes: [
                    {
                        scale: '1',
                        values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " ms"),
                    },
                    {
                        side: 1,
                        // size: 60,
                        scale: '2',
                        values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " hits"),
                        grid: {show: false}
                    }
                ],
                autoResize: true
            }
        });
    }



    createTableChart(request: FindBucketsRequest) {
        let dimensionKey = 'name';
        this.timeSeriesService.fetchBucketsNew({...request, groupDimensions: [dimensionKey], numberOfBuckets: 1}).subscribe(response => {
            console.log(response);
            this.tableDataSource = response.matrix.map((series, i) => {
                if (series.length != 1) { // we should have just one bucket
                    throw new Error('Something went wrong');
                }
                let attributes = response.matrixKeys[i];
                series[0].attributes = attributes;
                let color = this.colorsPool.getColor(attributes[dimensionKey]);
                series[0].attributes.color = color;
                series[0].attributes.avg = (series[0].sum / series[0].count).toFixed(0);
                this.keywords[attributes[dimensionKey]] = {color: color, isSelected: true};
                return series[0];
            });
            this.tableIsLoading = false;
        });
    }

    createByStatusChart(request: FindBucketsRequest) {
        this.timeSeriesService.fetchBuckets({...request, groupDimensions: ['rnStatus']}).subscribe(byStatusResponse => {
            const allSeries: TSChartSeries[] = [];
            let labels: number[] = [];
            let timestempsWereSet = false;
            Object.keys(byStatusResponse).forEach(key => {
                let bucketMap = byStatusResponse[key];
                let seriesKeys = Object.keys(bucketMap);
                let data: number[] = [];
                let formattedKeys: number[] = [];
                seriesKeys.forEach(key => {
                    data.push(bucketMap[key].count);
                    if (!timestempsWereSet) {
                        formattedKeys.push(parseInt(key) / 1000);
                    }
                })
                let color = this.random_rgba();
                allSeries.push({
                    label: key,
                    data: data,
                    // scale: 'mb',
                    // value: (self, x) => Math.trunc(x) + ' ms',
                    stroke: color,
                    fill: color.slice(0, -2) + '08'
                });

                if (!timestempsWereSet) {
                    labels = formattedKeys; // TODO here we should got the min and max from the series, and make the complete list of timestamps, and also make sure we deal with the same number of values as timestamps
                    timestempsWereSet = true;
                }
            });
            this.chart3Settings = {
                title: 'Keywords Statuses',
                showLegend: true,
                xValues: labels,
                series: allSeries,
                axes: [
                    // {
                    //     values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " ms"),
                    // },
                ],
                autoResize: true
            };
        });
    }

    createByMeasurementsCharts(request: FindBucketsRequest) {
        let dimensionKey = 'name';
        this.timeSeriesService.fetchBucketsNew({...request, groupDimensions: [dimensionKey]}).subscribe(response => {
            let timeLabels = this.createTimeLabels(response.start, response.end, response.interval);
            let totalData: number[] = Array(response.matrix[0].length); // TODO handle empty response
            let avgSeries :TSChartSeries[] = [];
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
                    points: {show: false}
                } as TSChartSeries;
                countSeries.push(series);
                avgSeries.push({...series, data: avgSeriesData});
                return series;
            });

            this.chart4Settings = {
                title: 'Throughput by keywords',
                xValues: timeLabels,
                showLegend: true,
                series: [{
                    scale: '2',
                    label: 'Total',
                    data: totalData,
                    value: (x, v) => Math.trunc(v) + ' total',
                    // stroke: '#E24D42',
                    fill: 'rgba(143,161,210,0.38)',
                    // fill: 'rgba(255,212,166,0.64)',
                    // points: {show: false},
                    // @ts-ignore
                    drawStyle: 1,
                    paths: this.barsFunction({size: [0.9, 100]}),
                    points: {show: false}
                },
                    ...series,
                ],
                axes: [
                    {
                        scale: '1',
                        values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " hits"),
                    },
                    {
                        side: 1,
                        // size: 60,
                        scale: '2',
                        values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " hits"),
                        grid: {show: false},

                    }
                ]
            };

            this.chart5Settings = {
                title: 'Response time by keywords',
                xValues: timeLabels,
                showLegend: true,
                series: avgSeries,
                axes: [
                    {
                        scale: '1',
                        values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " hits"),
                    },
                ]
            };
        });
    }

    private initRangerSettings(keyValues: number[], avgValues: number[]) {
        this.rangerSettings = {
            min: keyValues[0],
            max: keyValues[keyValues.length - 1],
            interval: 100,
            series: [{
                label: 'Response Time',
                data: avgValues,
                value: (self, x) => Math.trunc(x) + ' ms',
                stroke: 'red'
            }],
        };
    }

    onRangeChange(newRange: TSTimeRange) {
        console.log('RANGE CHANGED');
    }

    random_rgba() {
        var o = Math.round, r = Math.random, s = 255;
        let alpha = Math.max(Number(r().toFixed(1)), 0.5);
        return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + alpha + ')';
    }

    createTimeLabels(start: number, end: number, interval: number): number[] {
        let intervals = Math.ceil((end - start) / interval);
        const result = Array(intervals);
        for (let i = 0; i < intervals; i++) {
            result[i] = (start + (i * interval)) / 1000; // uplot uses seconds
        }
        return result;
    }



}

getAngularJSGlobal()
    .module(AJS_MODULE)
    .directive('stepExecutionPage', downgradeComponent({component: ExecutionPageComponent}));
