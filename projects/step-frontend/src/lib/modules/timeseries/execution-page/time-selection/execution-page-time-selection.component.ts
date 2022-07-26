import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TimeSelection } from '../../time-selection/model/time-selection';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesService } from '../../time-series.service';
import * as uPlot from 'uplot';
import { UPlotUtils } from '../../uplot/uPlot.utils';
import { TimeSeriesUtils } from '../../time-series-utils';
import { TSChartSettings } from '../../chart/model/ts-chart-settings';
import { TSRangerComponent } from '../../ranger/ts-ranger.component';
import { TSTimeRange } from '../../chart/model/ts-time-range';
import { TimeRangePicker } from '../../time-selection/time-range-picker.component';

@Component({
  selector: 'step-execution-time-selection',
  templateUrl: './execution-page-time-selection.component.html',
  styleUrls: ['./execution-page-time-selection.component.scss'],
})
export class ExecutionPageTimeSelectionComponent implements OnInit {
  @Input('execution') execution!: any;

  @Output('onRangeChange') onRangeChange = new EventEmitter<TSTimeRange>();
  @Output('onRangeReset') onRangeReset = new EventEmitter<TSTimeRange>();

  rangerSettings: TSChartSettings | undefined;
  @ViewChild(TSRangerComponent) rangerComponent!: TSRangerComponent;
  @ViewChild(TimeRangePicker) timeRangePicker!: TimeRangePicker;

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

  resetZoom(emitEvent = true) {
    this.onRangeReset.emit({
      start: this.rangerSettings.xValues[0],
      end: this.rangerSettings.xValues[this.rangerSettings.xValues.length - 1],
    });
    this.rangerComponent.resetSelect(false);
  }

  handleTimePickerSelectionChange(timeSelection: TimeSelection) {
    if (!timeSelection) {
      // we deal with a full range
      this.resetZoom();
      return;
    }
    if (timeSelection.isRelativeSelection) {
      let start = this.execution.endTime - timeSelection.relativeSelection?.timeInMs;
      this.rangerComponent.selectRange(start, undefined, false);
      this.onRangeChange.emit({ start: start, end: this.execution.endTime });
    }
  }

  onRangerSelectionChange(event: TSTimeRange) {
    console.log('EVENT EMITED!');
    this.timeRangePicker.setCustomSelection(event.start, event.end);
    this.onRangeChange.emit(event);
  }

  onRangerZoomReset(event: TSTimeRange) {
    this.timeRangePicker.selectFullRange();
  }
}
