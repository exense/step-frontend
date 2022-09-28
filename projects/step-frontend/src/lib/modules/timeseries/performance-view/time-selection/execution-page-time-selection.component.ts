import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ExecutionTimeSelection } from '../../time-selection/model/execution-time-selection';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesService } from '../../time-series.service';
import { TimeSeriesUtils } from '../../time-series-utils';
import { TSChartSettings } from '../../chart/model/ts-chart-settings';
import { TSRangerComponent } from '../../ranger/ts-ranger.component';
import { TSTimeRange } from '../../chart/model/ts-time-range';
import { TimeRangePicker } from '../../time-selection/time-range-picker.component';
import { ExecutionContext } from '../../execution-page/execution-context';
import { RangeSelectionType } from '../../time-selection/model/range-selection-type';
import { TimeRangePickerSelection } from '../../time-selection/time-range-picker-selection';
import { TimeSeriesConfig } from '../../time-series.config';
import { TSRangerSettings } from '../../ranger/ts-ranger-settings';
import { TimeSeriesContextsFactory } from '../../time-series-contexts-factory.service';
import { Execution } from '@exense/step-core';
import { PerformanceViewSettings } from '../performance-view-settings';
import { Subscription } from 'rxjs';

@Component({
  selector: 'step-execution-time-selection',
  templateUrl: './execution-page-time-selection.component.html',
  styleUrls: ['./execution-page-time-selection.component.scss'],
})
export class ExecutionPageTimeSelectionComponent implements OnInit, OnDestroy {
  // @Input() execution!: Execution;
  @Input() settings!: PerformanceViewSettings;
  @Input() timePicker: boolean = true;

  @Output('onRangeChange') onRangeChange = new EventEmitter<TSTimeRange>();
  @Output('onRangeReset') onRangeReset = new EventEmitter<TSTimeRange>();

  rangerSettings: TSRangerSettings | undefined;
  @ViewChild(TSRangerComponent) rangerComponent!: TSRangerComponent;
  @ViewChild(TimeRangePicker) timeRangePicker: TimeRangePicker | undefined;

  timeLabels: number[] = [];

  subscriptions: Subscription = new Subscription();

  selection!: ExecutionTimeSelection;

  private executionService!: ExecutionContext;

  constructor(private timeSeriesService: TimeSeriesService, private executionsPageService: TimeSeriesContextsFactory) {}

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Settings input is required');
    }
    this.executionService = this.executionsPageService.getContext(this.settings.contextId);
    this.selection = this.executionService.getActiveSelection();
    this.subscriptions.add(
      this.executionService.onActiveSelectionChange().subscribe((range) => {
        this.selection = range;
      })
    );
    this.createRanger();
  }

  getActiveSelection(): ExecutionTimeSelection {
    return this.selection;
  }

  refreshRanger() {
    this.createRanger();
    // this.timeSeriesService.fetchBuckets(this.r).subscribe((response) => {
    //
    // });
  }

  createRanger() {
    let startTime = this.settings.startTime!;
    let endTime = this.settings.endTime || new Date().getTime() - 5000; // minus 5 seconds
    let request: FindBucketsRequest = {
      intervalSize: 0,
      params: this.settings.contextualFilters,
      start: startTime,
      end: endTime, // to current time if it's not ended
      numberOfBuckets: Math.trunc(
        Math.min(TimeSeriesConfig.MAX_BUCKETS_IN_CHART, (endTime - startTime) / TimeSeriesConfig.RESOLUTION / 2)
      ),
    };
    this.timeSeriesService.fetchBuckets(request).subscribe((response) => {
      this.timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
      let avgData: (number | null)[] = [];
      if (response.matrix[0]) {
        avgData = response.matrix[0].map((b) => (b ? b.sum / b.count : null));
      }

      let timeRange = this.prepareSelectForRanger(this.executionService.getActiveSelection());
      this.rangerSettings = {
        xValues: this.timeLabels,
        selection: timeRange,
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

  prepareSelectForRanger(selection: ExecutionTimeSelection): TSTimeRange | undefined {
    if (selection.type === RangeSelectionType.FULL) {
      return undefined;
    } else {
      // it is relative or absolute
      return selection.absoluteSelection;
    }
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
    this.timeRangePicker?.selectFullRange();
  }

  handleTimePickerSelectionChange(timeSelection: TimeRangePickerSelection) {
    let selectionToEmit: ExecutionTimeSelection = { type: timeSelection.type };
    if (timeSelection.type === RangeSelectionType.FULL) {
      this.rangerComponent.resetSelect(false);
    } else if (timeSelection.type === RangeSelectionType.RELATIVE && timeSelection.relativeSelection) {
      let endTime = this.settings.endTime || new Date().getTime();
      let from = endTime - timeSelection.relativeSelection.timeInMs;
      selectionToEmit.relativeSelection = timeSelection.relativeSelection;
      selectionToEmit.absoluteSelection = { from, to: endTime };
      this.rangerComponent.selectRange(from, endTime);
    } else if (timeSelection.type === RangeSelectionType.ABSOLUTE && timeSelection.absoluteSelection) {
      selectionToEmit.absoluteSelection = timeSelection.absoluteSelection;
      this.rangerComponent.selectRange(timeSelection.absoluteSelection.from, timeSelection.absoluteSelection.to);
    }
    this.executionService.setActiveSelection(selectionToEmit);
    this.onRangeChange.emit(selectionToEmit.absoluteSelection);
  }

  onRangerSelectionChange(event: TSTimeRange) {
    if (this.timeLabels[0] === event.from && this.timeLabels[this.timeLabels.length - 1] === event.to) {
      this.timeRangePicker?.selectFullRange();
    } else {
      this.timeRangePicker?.setAbsoluteSelection(event.from, event.to);
    }

    this.onRangeChange.emit(event);
  }

  onRangerZoomReset(event: TSTimeRange) {
    this.timeRangePicker?.selectFullRange();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
