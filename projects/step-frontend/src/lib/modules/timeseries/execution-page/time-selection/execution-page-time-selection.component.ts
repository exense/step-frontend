import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TimeSelection } from '../../time-selection/model/time-selection';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesService } from '../../time-series.service';
import * as uPlot from 'uplot';
import { UPlotUtils } from '../../uplot/uPlot.utils';
import { TimeSeriesUtils } from '../../time-series-utils';
import { TSChartSettings } from '../../chart/model/ts-chart-settings';

@Component({
  selector: 'step-execution-time-selection',
  templateUrl: './execution-page-time-selection.component.html',
  styleUrls: ['./execution-page-time-selection.component.scss'],
})
export class ExecutionPageTimeSelectionComponent implements OnInit {
  @Input('execution') execution!: any;

  ranger: uPlot;
  rangerSettings: TSChartSettings | undefined;

  constructor(private timeSeriesService: TimeSeriesService) {}

  ngOnInit(): void {
    this.createRanger();
  }

  createRanger() {
    let request: FindBucketsRequest = {
      intervalSize: 0,
      params: { eId: this.execution.id },
      start: this.execution.startTime,
      end: this.execution.endTime,
      numberOfBuckets: 30,
    };
    this.timeSeriesService.fetchBucketsNew(request).subscribe((response) => {
      let timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
      console.log('TIME: ', response.start, response.end);
      let avgData = response.matrix[0].map((b) => (b ? b.sum / b.count : null));
      this.rangerSettings = {
        title: 'Ranger',
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
      // if (this.ranger) {
      //   this.ranger.redrawChart();
      // }
    });
  }

  handleTimeSelectionChange(timeSelection: TimeSelection) {}

  onRangeChange(event: any) {}
}
