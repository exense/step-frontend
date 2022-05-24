import { Component, ElementRef, OnChanges, OnInit, ViewChild } from "@angular/core";
import * as uPlot from "uplot";
import {downgradeComponent, getAngularJSGlobal} from '@angular/upgrade/static';
import { AJS_MODULE} from '@exense/step-core';
import {TSChartSettings} from '../chart/model/ts-chart-settings';
import {TimeSeriesService} from '../time-series.service';

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
                series: [{
                    label: 'Response Time',
                    data: avgValues,
                    valueFormatFunction: (x) => Math.trunc(x) + ' ms',
                    stroke: 'red'
                }],
                autoResize: true
            }
            this.chart2Settings = {
                title: 'Measurements Count',
                xValues: keyValues,
                series: [{
                    label: 'Measurements Count',
                    data: countValues,
                    valueFormatFunction: (x) => Math.trunc(x) + ' ms',
                    stroke: 'blue'
                }],
                autoResize: true
            }
            this.chart3Settings = {
                title: 'Average Response Time',
                xValues: keyValues,
                series: [{
                    label: 'Response Time',
                    data: avgValues,
                    valueFormatFunction: (x) => Math.trunc(x) + ' ms',
                    stroke: 'red'
                }],
                autoResize: true
            }
            // this.uplot1.setData([keyValues, avgValues]);
        });
    }




}

getAngularJSGlobal()
    .module(AJS_MODULE)
    .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
