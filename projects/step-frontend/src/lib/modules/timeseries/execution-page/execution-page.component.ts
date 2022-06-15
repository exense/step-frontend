import {Component, ElementRef, OnChanges, OnInit, ViewChild} from "@angular/core";
import {downgradeComponent, getAngularJSGlobal} from '@angular/upgrade/static';
import {AJS_MODULE} from '@exense/step-core';
import {TSChartSeries, TSChartSettings} from '../chart/model/ts-chart-settings';
import {TimeSeriesService} from '../time-series.service';
import {TSRangerSettings} from '../ranger/ts-ranger-settings';
import {FindBucketsRequest} from '../find-buckets-request';
import {TimeseriesColorsPool} from '../util/timeseries-colors-pool';
import {Bucket} from '../bucket';
import {TimeSeriesChartComponent} from '../chart/time-series-chart.component';
import {KeyValue} from '@angular/common';
import {TSTimeRange} from '../chart/model/ts-time-range';
import {TSRangerComponent} from '../ranger/ts-ranger.component';
import {UPlotUtils} from '../uplot/uPlot.utils';
import {TimeSeriesConfig} from '../time-series.config';

declare const uPlot: any;

@Component({
    selector: 'step-execution-page',
    templateUrl: './execution-page.component.html',
    styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit {

    private RESOLUTION_MS = 1000;
    syncKey = 'test';
    executionId = window.location.href.split('/').slice(-1)[0]; // last part of URL

    chart1Settings: TSChartSettings;
    chart2Settings: TSChartSettings;
    chart3Settings: TSChartSettings;
    chart4Settings: TSChartSettings;
    chart5Settings: TSChartSettings;
    chart6Settings: TSChartSettings;
    rangerSettings: TSRangerSettings;

    @ViewChild('ranger') ranger: TSRangerComponent;
    @ViewChild('chart4') chart4: TimeSeriesChartComponent;
    @ViewChild('chart5') chart5: TimeSeriesChartComponent;

    tableColumns = ['name', 'count', 'sum', 'avg', 'min', 'max'];
    tableDataSource: Bucket[] = [];
    tableIsLoading = true;

    colorsPool = new TimeseriesColorsPool();

    barsFunction = uPlot.paths.bars;
    stepped = uPlot.paths.stepped;

    keywords: { [key: string]: { isSelected: boolean, color: string } } = {};
    keywordSearchValue: string;

    findRequest: FindBucketsRequest;

    // @ts-ignore
    paths = (u, seriesIdx: number, idx0: number, idx1: number, extendGap, buildClip) => {
        return this.barsFunction(u, seriesIdx, idx0, idx1, extendGap, buildClip);
    }

    valueAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
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
        this.findRequest = {
            start: 0,
            end: -1,
            intervalSize: 2500,
            params: {eId: this.executionId}
        };
        this.timeSeriesService.getExecutionDetails(this.executionId).subscribe(details => {
            this.findRequest.start = details.startTime - details.startTime % this.RESOLUTION_MS;
            this.findRequest.end = details.endTime + (this.RESOLUTION_MS - details.endTime % this.RESOLUTION_MS);
            this.createRanger(this.findRequest);
            this.createSummaryChart(this.findRequest);
            this.createTableChart(this.findRequest);
            this.createByStatusChart(this.findRequest);
            this.createByKeywordsCharts(this.findRequest);
            this.createThreadGroupsChart(this.findRequest);
        });
    }

    onZoomReset() {
        this.ranger.resetSelect(); // this will trigger a range change event

    }

    createThreadGroupsChart(request: FindBucketsRequest) {
        let dimensionKey = 'name';
        this.timeSeriesService.fetchBucketsNew({...request, threadGroupBuckets: true, groupDimensions: [dimensionKey]}).subscribe(response => {
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
                    paths: this.stepped({align: 1}),
                    points: {show: false}
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
                    dataIdx: UPlotUtils.closestNotEmptyPointFunction
                },
                series: [
                    {
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
                        paths: this.stepped({align: 1}),
                        points: {show: false},
                    },
                    ...series,
                ],
                axes: [
                    {
                        scale: '1',
                        values: (u, vals, space) => vals.map(v => +v.toFixed(0)),
                    },
                    {
                        side: 1,
                        // size: 60,
                        scale: '2',
                        values: (u, vals, space) => vals.map(v => +v.toFixed(0)),
                        grid: {show: false},

                    }
                ]
            };

        });
    }

    createRanger(request: FindBucketsRequest) {
        this.timeSeriesService.fetchBucketsNew(request).subscribe(response => {
            let timeLabels = this.createTimeLabels(response.start, response.end, response.interval);
            console.log('TIME: ', response.start, response.end);
            let avgData = response.matrix[0].map(b => b ? b.sum / b.count : null);
            this.rangerSettings = {
                xValues: timeLabels,
                series: [{
                    label: 'Response Time',
                    data: avgData,
                    // value: (self, x) => Math.trunc(x) + ' ms',
                    stroke: 'red'
                }],
            };
        });
    }

    createSummaryChart(request: FindBucketsRequest) {
        this.timeSeriesService.fetchBucketsNew(request).subscribe((response) => {
            let xLabels = this.createTimeLabels(response.start, response.end, response.interval);
            let avgValues: number[] = [];
            let countValues: number[] = [];
            if (response.matrix.length === 0) {
                return; // TODO handle
            }
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
        this.tableIsLoading = true;
        this.timeSeriesService.fetchBucketsNew({...request, groupDimensions: [dimensionKey], numberOfBuckets: 1}).subscribe(response => {
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
            }).sort((a, b) => a.attributes.name.toLowerCase() > b.attributes.name.toLowerCase() ? 1 : -1);
            this.tableIsLoading = false;
        });
    }

    createByStatusChart(request: FindBucketsRequest) {
        this.timeSeriesService.fetchBucketsNew({...request, groupDimensions: ['rnStatus']}).subscribe(response => {
            let xLabels = this.createTimeLabels(response.start, response.end, response.interval);
            let series: TSChartSeries[] = response.matrix.map((series, i) => {
                let status = response.matrixKeys[i]['rnStatus'];
                let color = this.colorsPool.getStatusColor(status);
                return {
                    label: status,
                    data: series.map(b => b? b.count: null),
                    // scale: 'mb',
                    // value: (self, x) => Math.trunc(x) + ' ms',
                    stroke: color,
                    fill: color + '20'
                }
            });
            this.chart3Settings = {
                title: 'Keyword Statuses',
                showLegend: true,
                xValues: xLabels,
                series: series,
                axes: [
                    {
                        values: (u, vals, space) => vals.map(v => Math.trunc(v)),
                    }]
            }
        });
        // this.timeSeriesService.fetchBuckets({...request, groupDimensions: ['rnStatus']}).subscribe(byStatusResponse => {
        //     const allSeries: TSChartSeries[] = [];
        //     let labels: number[] = [];
        //     let timestampsWereSet = false;
        //     Object.keys(byStatusResponse).forEach(key => {
        //         let bucketMap = byStatusResponse[key];
        //         let seriesKeys = Object.keys(bucketMap);
        //         let data: number[] = [];
        //         let formattedKeys: number[] = [];
        //         seriesKeys.forEach(key => {
        //             data.push(bucketMap[key].count);
        //             if (!timestampsWereSet) {
        //                 formattedKeys.push(parseInt(key));
        //             }
        //         });
        //         key = key.replace('{rnStatus=', '').slice(0, -1); // last }
        //         let color = this.colorsPool.getStatusColor(key);
        //         console.log(color);
        //         allSeries.push({
        //             label: key,
        //             data: data,
        //             // scale: 'mb',
        //             // value: (self, x) => Math.trunc(x) + ' ms',
        //             stroke: color,
        //             fill: color + '20'
        //         });
        //
        //         if (!timestampsWereSet) {
        //             labels = formattedKeys; // TODO here we should got the min and max from the series, and make the complete list of timestamps, and also make sure we deal with the same number of values as timestamps
        //             timestampsWereSet = true;
        //         }
        //     });
        //     this.chart3Settings = {
        //         title: 'Keywords Statuses',
        //         showLegend: true,
        //         xValues: labels,
        //         series: allSeries,
        //         axes: [
        //             // {
        //             //     values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " ms"),
        //             // },
        //         ],
        //         autoResize: true
        //     };
        // });
    }

    createByKeywordsCharts(request: FindBucketsRequest) {
        let dimensionKey = 'name';
        this.timeSeriesService.fetchBucketsNew({...request, groupDimensions: [dimensionKey]}).subscribe(response => {
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

    onRangeChange(newRange: TSTimeRange) {
        this.findRequest.start = Math.trunc(newRange.start);
        this.findRequest.end = Math.trunc(newRange.end);
        this.createTableChart(this.findRequest);
    }

    createTimeLabels(start: number, end: number, interval: number): number[] {
        let intervals = Math.ceil((end - start) / interval);
        const result = Array(intervals + 1);
        for (let i = 0; i < intervals; i++) {
            result[i] = (start + (i * interval)); //
        }
        result[intervals] = result[intervals - 1] + TimeSeriesConfig.RESOLUTION; // we add one second as a small padding

        return result;
    }


}

getAngularJSGlobal()
    .module(AJS_MODULE)
    .directive('stepExecutionPage', downgradeComponent({component: ExecutionPageComponent}));
