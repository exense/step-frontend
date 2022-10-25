import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ExecutionTimeSelection } from '../../time-selection/model/execution-time-selection';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesService } from '../../time-series.service';
import { TimeSeriesUtils } from '../../time-series-utils';
import { TSRangerComponent } from '../../ranger/ts-ranger.component';
import { TSTimeRange } from '../../chart/model/ts-time-range';
import { TimeRangePicker } from '../../time-selection/time-range-picker.component';
import { TimeSeriesContext } from '../../execution-page/time-series-context';
import { RangeSelectionType } from '../../time-selection/model/range-selection-type';
import { TimeRangePickerSelection } from '../../time-selection/time-range-picker-selection';
import { TimeSeriesConfig } from '../../time-series.config';
import { TSRangerSettings } from '../../ranger/ts-ranger-settings';
import { TimeSeriesContextsFactory } from '../../time-series-contexts-factory.service';
import { PerformanceViewSettings } from '../performance-view-settings';
import { Observable, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { TimeSeriesChartResponse } from '../../time-series-chart-response';
import { TimeSelectionState } from '../../time-selection.state';

@Component({
  selector: 'step-execution-time-selection',
  templateUrl: './performance-view-time-selection.component.html',
  styleUrls: ['./performance-view-time-selection.component.scss'],
})
export class PerformanceViewTimeSelectionComponent implements OnInit, OnDestroy {
  @Input() settings!: PerformanceViewSettings;
  @Input() timePicker: boolean = true;

  @Output() onRangerLoaded = new EventEmitter<void>();

  rangerSettings: TSRangerSettings | undefined;
  @ViewChild(TSRangerComponent) rangerComponent!: TSRangerComponent;
  @ViewChild(TimeRangePicker) timeRangePicker: TimeRangePicker | undefined;

  timeLabels: number[] = [];

  currentSelection!: ExecutionTimeSelection;

  private executionService!: TimeSeriesContext;
  private timeSelectionState!: TimeSelectionState;
  private terminator$ = new Subject<void>();

  constructor(private timeSeriesService: TimeSeriesService, private executionsPageService: TimeSeriesContextsFactory) {}

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Settings input is required');
    }
    this.executionService = this.executionsPageService.getContext(this.settings.contextId);
    this.timeSelectionState = this.executionService.timeSelectionState;
    this.currentSelection = this.timeSelectionState.getActiveSelection();
    this.createRanger().subscribe(() => this.onRangerLoaded.next());
    this.timeSelectionState
      .onZoomReset()
      .pipe(takeUntil(this.terminator$))
      .subscribe((reset) => {
        this.rangerComponent.resetSelect();
        this.timeRangePicker?.selectFullRange();
      });
    this.timeSelectionState
      .onActiveSelectionChange()
      .pipe(takeUntil(this.terminator$))
      .subscribe((selection) => {
        this.currentSelection = selection;
        this.rangerComponent.selectRange(selection.absoluteSelection?.from, selection.absoluteSelection?.to);
        this.timeRangePicker?.setSelection(selection);
      });
  }

  getActiveSelection(): ExecutionTimeSelection {
    return this.currentSelection;
  }

  refreshRanger(): Observable<TimeSeriesChartResponse> {
    return this.createRanger();
  }

  createRanger(): Observable<TimeSeriesChartResponse> {
    const startTime = this.settings.startTime!;
    const endTime = this.settings.endTime || new Date().getTime() - 5000; // minus 5 seconds
    const request: FindBucketsRequest = {
      params: this.settings.contextualFilters,
      start: startTime,
      end: endTime, // to current time if it's not ended
      numberOfBuckets: TimeSeriesConfig.MAX_BUCKETS_IN_CHART,
    };
    return this.timeSeriesService.fetchBuckets(request).pipe(
      tap((response) => {
        this.timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
        let avgData: (number | null)[] = [];
        if (response.matrix[0]) {
          avgData = response.matrix[0].map((b) => (b ? b.sum / b.count : null));
        }

        const timeRange = this.prepareSelectForRanger(this.executionService.timeSelectionState.getActiveSelection());
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
      })
    );
  }

  prepareSelectForRanger(selection: ExecutionTimeSelection): TSTimeRange | undefined {
    if (selection.type === RangeSelectionType.FULL) {
      return undefined;
    } else {
      // it is relative or absolute
      return selection.absoluteSelection;
    }
  }

  handleTimePickerSelectionChange(timeSelection: TimeRangePickerSelection) {
    let selectionToEmit: ExecutionTimeSelection = { type: timeSelection.type };
    if (timeSelection.type === RangeSelectionType.FULL) {
      this.timeSelectionState.resetZoom();
      return;
    } else if (timeSelection.type === RangeSelectionType.RELATIVE && timeSelection.relativeSelection) {
      let endTime = this.settings.endTime || new Date().getTime();
      let from = endTime - timeSelection.relativeSelection.timeInMs;
      selectionToEmit.relativeSelection = timeSelection.relativeSelection;
      selectionToEmit.absoluteSelection = { from, to: endTime };
    } else if (timeSelection.type === RangeSelectionType.ABSOLUTE && timeSelection.absoluteSelection) {
      selectionToEmit.absoluteSelection = timeSelection.absoluteSelection;
    }
    this.timeSelectionState.setActiveSelection(selectionToEmit);
  }

  onRangerSelectionChange(event: TSTimeRange) {
    // check for full range selection
    if (this.timeLabels[0] === event.from && this.timeLabels[this.timeLabels.length - 1] === event.to) {
      this.timeSelectionState.resetZoom();
    } else {
      this.timeSelectionState.setActiveSelection({ type: RangeSelectionType.ABSOLUTE, absoluteSelection: event });
    }
    // the linked charts are automatically updated by the uplot sync feature. if that will be replaced, the charts must subscribe to the state change
  }

  onRangerZoomReset(event: TSTimeRange) {
    this.timeSelectionState.resetZoom();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}
