import { Component, ElementRef, OnChanges, OnInit, ViewChild } from "@angular/core";
import * as uPlot from "uplot";
import {downgradeComponent, getAngularJSGlobal} from '@angular/upgrade/static';
import { AJS_MODULE} from '@exense/step-core';
import {TSChartSettings} from '../chart/model/ts-chart-settings';
import {TimeSeriesService} from '../time-series.service';
import {TSRangerSettings} from '../ranger/ts-ranger-settings';

@Component({
  selector: 'step-execution-page',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit {

    executionId = window.location.href.split('/').slice(-1)[0]; // last part of URL

    chart1Settings: TSChartSettings;
    chart2Settings: TSChartSettings;
    chart3Settings: TSChartSettings;
    rangerSettings: TSRangerSettings;

    constructor(private timeSeriesService: TimeSeriesService) {
    }

    ngOnInit(): void {
        let request = {
            start: 0,
            end: 9999999999999,
            intervalSize: 2500,
            params: {eId: this.executionId}
        };
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
            this.chart1Settings = {
                title: 'Average Response Time',
                xValues: keyValues,
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
                            console.log(self);
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
            this.chart2Settings = {
                title: 'Measurements Count',
                xValues: keyValues,
                series: [{
                    label: 'Measurements Count',
                    data: countValues,
                    scale: 'mb',
                    value: (self, x) => Math.trunc(x) + ' ms',
                    stroke: 'blue'
                }],
                axes: [
                    {
                        scale: '%',
                        values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " ms"),
                    },
                    {
                        side: 1,
                        scale: "mb",
                        size: 60,
                        values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " MB"),
                        grid: {show: false},
                    },
                ],
                autoResize: true
            }
            this.chart3Settings = {
                title: 'Average Response Time',
                xValues: keyValues,
                series: [{
                    label: 'Response Time',
                    data: avgValues,
                    value: (self, x) => Math.trunc(x) + ' ms',
                    stroke: 'red'
                }],
                axes: [
                    {
                        scale: '1',
                        values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " ms"),
                    },
                ],
                autoResize: true
            };
            console.log(keyValues[keyValues.length - 1]);
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

        });
    }




}

getAngularJSGlobal()
    .module(AJS_MODULE)
    .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
