import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ExecutionTimeSelection } from '../../time-selection/model/execution-time-selection';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesService } from '../../time-series.service';
import { TimeSeriesUtils } from '../../time-series-utils';
import { TSChartSettings } from '../../chart/model/ts-chart-settings';
import { TSRangerComponent } from '../../ranger/ts-ranger.component';
import { TSTimeRange } from '../../chart/model/ts-time-range';
import { TimeRangePicker } from '../../time-selection/time-range-picker.component';
import { TimeSeriesExecutionService } from '../time-series-execution.service';
import { RangeSelectionType } from '../../time-selection/model/range-selection-type';
import { TimeRangePickerSelection } from '../../time-selection/time-range-picker-selection';

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

  timeLabels: number[] = [];

  selection!: ExecutionTimeSelection;

  constructor(private timeSeriesService: TimeSeriesService, private executionService: TimeSeriesExecutionService) {}

  ngOnInit(): void {
    this.executionService.onActiveSelectionChange().subscribe((range) => {
      this.selection = range;
      console.log(this.selection);
    });
    this.createRanger();
  }

  refresh() {
    this.createRanger();
  }

  createRanger() {
    let request: FindBucketsRequest = {
      intervalSize: 0,
      params: { eId: this.execution.id },
      start: this.execution.startTime,
      end: this.execution.endTime || new Date().getTime(), // to current time if it's not ended
      numberOfBuckets: 100,
    };
    this.timeSeriesService.fetchBucketsNew(request).subscribe((response) => {
      this.timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
      let avgData = response.matrix[0].map((b) => (b ? b.sum / b.count : null));
      this.rangerSettings = {
        title: 'Ranger',
        xValues: this.timeLabels,
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

  resetZoom() {
    if (!this.rangerSettings) {
      return;
    }
    // this.onRangeReset.emit({
    //   start: this.rangerSettings.xValues[0],
    //   end: this.rangerSettings.xValues[this.rangerSettings.xValues.length - 1],
    // });
    this.rangerComponent.resetSelect(false);
    this.timeRangePicker.selectFullRange();
  }

  handleTimePickerSelectionChange(timeSelection: TimeRangePickerSelection) {
    let selectionToEmit: ExecutionTimeSelection = { type: timeSelection.type };
    if (timeSelection.type === RangeSelectionType.FULL) {
      this.rangerComponent.resetSelect(false);
    } else if (timeSelection.type === RangeSelectionType.RELATIVE && timeSelection.relativeSelection) {
      let endTime = this.execution.endTime || new Date().getTime();
      let from = endTime - timeSelection.relativeSelection.timeInMs;
      this.selection.absoluteSelection = { from, to: endTime };
      this.rangerComponent.selectRange(from, endTime);
    } else if (timeSelection.type === RangeSelectionType.ABSOLUTE && timeSelection.absoluteSelection) {
      this.rangerComponent.selectRange(timeSelection.absoluteSelection.from, timeSelection.absoluteSelection.to);
    }

    this.executionService.setActiveSelection(selectionToEmit);

    // if (!timeSelection) {
    //   // we deal with a full range
    //   this.resetZoom();
    //   this.executionService.setActiveSelection()
    //   return;
    // }
    // if (timeSelection.isRelativeSelection && timeSelection.relativeSelection) {
    //   let start = this.execution.endTime - timeSelection.relativeSelection.timeInMs;
    //   let now = new Date().getTime();
    //   timeSelection.range = {start: start, end: now};
    //   this.rangerComponent.selectRange(start, undefined, false);
    //   this.onRangeChange.emit({ start: start, end: this.execution.endTime });
    // }
    // this.executionService.setActiveSelection(timeSelection);
  }

  onRangerSelectionChange(event: TSTimeRange) {
    if (this.timeLabels[0] === event.from && this.timeLabels[this.timeLabels.length - 1] === event.to) {
      this.timeRangePicker.selectFullRange();
    } else {
      this.timeRangePicker.setAbsoluteSelection(event.from, event.to);
    }

    // this.onRangeChange.emit(event);
  }

  onRangerZoomReset(event: TSTimeRange) {
    this.timeRangePicker.selectFullRange();
  }
}
