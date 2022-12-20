import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ExecutionTimeSelection } from '../../time-selection/model/execution-time-selection';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesService } from '../../time-series.service';
import { TimeSeriesUtils } from '../../time-series-utils';
import { TSRangerComponent } from '../../ranger/ts-ranger.component';
import { TSTimeRange } from '../../chart/model/ts-time-range';
import { TimeRangePicker } from '../../time-selection/time-range-picker.component';
import { TimeSeriesContext } from '../../time-series-context';
import { RangeSelectionType } from '../../time-selection/model/range-selection-type';
import { TimeRangePickerSelection } from '../../time-selection/time-range-picker-selection';
import { TimeSeriesConfig } from '../../time-series.config';
import { TSRangerSettings } from '../../ranger/ts-ranger-settings';
import { TimeSeriesContextsFactory } from '../../time-series-contexts-factory.service';
import { PerformanceViewSettings } from '../model/performance-view-settings';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { TimeSeriesChartResponse } from '../../time-series-chart-response';
import { TimeSelectionState } from '../../time-selection.state';

@Component({
  selector: 'step-execution-time-selection',
  templateUrl: './performance-view-time-selection.component.html',
  styleUrls: ['./performance-view-time-selection.component.scss'],
})
export class PerformanceViewTimeSelectionComponent implements OnInit, OnDestroy {
  @Input() settings!: PerformanceViewSettings;

  @Output() onRangerLoaded = new EventEmitter<void>();

  rangerSettings: TSRangerSettings | undefined;
  @ViewChild(TSRangerComponent) rangerComponent!: TSRangerComponent;

  timeLabels: number[] = [];

  private tsContext!: TimeSeriesContext;
  private terminator$ = new Subject<void>();

  constructor(private timeSeriesService: TimeSeriesService, private executionsPageService: TimeSeriesContextsFactory) {}

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Settings input is required');
    }
    this.tsContext = this.executionsPageService.getContext(this.settings.contextId);
    this.createRanger(this.tsContext.getFullTimeRange()).subscribe(() => this.onRangerLoaded.next());
    this.tsContext
      .onSelectedTimeRangeChange()
      .pipe(takeUntil(this.terminator$))
      .subscribe((selection) => {
        if (this.tsContext.isFullRangeSelected()) {
          this.rangerComponent.resetSelect();
        } else {
          this.rangerComponent.selectRange(selection);
        }
      });
    this.tsContext
      .onFullRangeChange()
      .pipe(takeUntil(this.terminator$))
      .subscribe((range) => {
        this.settings.timeRange = range;
        let customSelection = undefined;
        if (!this.tsContext.isFullRangeSelected()) {
          customSelection = this.tsContext.getSelectedTimeRange();
        }
        this.createRanger(this.tsContext.getFullTimeRange(), customSelection).subscribe();
      });
  }

  updateFullTimeRange(range: TSTimeRange) {
    this.settings.timeRange = range;
  }

  refreshRanger(): Observable<TimeSeriesChartResponse> {
    const selection = this.tsContext.getSelectedTimeRange();
    return this.createRanger(
      this.tsContext.getFullTimeRange(),
      this.tsContext.isFullRangeSelected() ? undefined : selection
    );
  }

  createRanger(fullTimeRange: TSTimeRange, selection?: TSTimeRange): Observable<TimeSeriesChartResponse> {
    const request: FindBucketsRequest = {
      params: this.settings.contextualFilters,
      start: fullTimeRange.from,
      end: fullTimeRange.to, // to current time if it's not ended
      numberOfBuckets: TimeSeriesConfig.MAX_BUCKETS_IN_CHART,
    };
    return this.timeSeriesService.fetchBuckets(request).pipe(
      tap((response) => {
        this.timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
        let avgData: (number | null)[] = [];
        if (response.matrix[0]) {
          avgData = response.matrix[0].map((b) => (b ? Math.round(b.sum / b.count) : null));
        }

        this.rangerSettings = {
          xValues: this.timeLabels,
          selection: selection,
          series: [
            {
              id: 'avg',
              label: 'Response Time',
              data: avgData,
              // value: (self, x) => Math.trunc(x) + ' ms',
              stroke: 'red',
              legendName: 'Ranger',
            },
          ],
        };
      })
    );
  }

  onRangerSelectionChange(event: TSTimeRange) {
    // check for full range selection
    this.tsContext.updateSelectedRange(event);
    // the linked charts are automatically updated by the uplot sync feature. if that will be replaced, the charts must subscribe to the state change
  }

  onRangerZoomReset() {
    this.tsContext.resetZoom();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}
