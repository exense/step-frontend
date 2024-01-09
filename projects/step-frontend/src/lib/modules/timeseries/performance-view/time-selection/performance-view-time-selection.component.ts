import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesUtils } from '../../time-series-utils';
import { TSRangerComponent } from '../../ranger/ts-ranger.component';
import { TimeSeriesContext } from '../../time-series-context';
import { TimeSeriesConfig } from '../../time-series.config';
import { TSRangerSettings } from '../../ranger/ts-ranger-settings';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { TimeRange, TimeSeriesAPIResponse, TimeSeriesService } from '@exense/step-core';
import { FindBucketsRequestBuilder } from '../../util/find-buckets-request-builder';

@Component({
  selector: 'step-execution-time-selection',
  templateUrl: './performance-view-time-selection.component.html',
  styleUrls: ['./performance-view-time-selection.component.scss'],
})
export class PerformanceViewTimeSelectionComponent implements OnInit, OnDestroy {
  @Input() context!: TimeSeriesContext;

  @Output() rangerLoaded = new EventEmitter<void>();

  rangerSettings: TSRangerSettings | undefined;
  @ViewChild(TSRangerComponent) rangerComponent!: TSRangerComponent;

  timeLabels: number[] = [];

  private terminator$ = new Subject<void>();

  private timeSeriesService = inject(TimeSeriesService);

  ngOnInit(): void {
    if (!this.context) {
      throw new Error('Settings input is required');
    }
    this.createRanger(this.context.getFullTimeRange()).subscribe(() => this.rangerLoaded.next());
    this.context
      .onTimeSelectionChange()
      .pipe(takeUntil(this.terminator$))
      .subscribe((selection) => {
        if (this.context.isFullRangeSelected()) {
          this.rangerComponent.resetSelect();
        } else {
          this.rangerComponent.selectRange(selection);
        }
      });
    this.context
      .onFullRangeChange()
      .pipe(takeUntil(this.terminator$))
      .subscribe((range) => {
        // this.settings.timeRange = range;
        let customSelection = undefined;
        if (!this.context.isFullRangeSelected()) {
          customSelection = this.context.getSelectedTimeRange();
        }
        this.createRanger(this.context.getFullTimeRange(), customSelection).subscribe();
      });
  }

  updateFullTimeRange(range: TimeRange) {
    // this.settings.timeRange = range;
  }

  refreshRanger(): Observable<TimeSeriesAPIResponse> {
    const selection = this.context.getSelectedTimeRange();
    return this.createRanger(
      this.context.getFullTimeRange(),
      this.context.isFullRangeSelected() ? undefined : selection
    );
  }

  createRanger(fullTimeRange: TimeRange, selection?: TimeRange): Observable<TimeSeriesAPIResponse> {
    console.log('creating ranger');
    const request = new FindBucketsRequestBuilder()
      .withRange(fullTimeRange)
      .addAttribute(TimeSeriesConfig.METRIC_TYPE_KEY, TimeSeriesConfig.METRIC_TYPE_RESPONSE_TIME)
      .withFilteringSettings(this.context.getFilteringSettings())
      .withNumberOfBuckets(TimeSeriesConfig.MAX_BUCKETS_IN_CHART)
      .withFilterAttributesMask(TimeSeriesConfig.RANGER_FILTER_FIELDS)
      .withSkipCustomOQL(true)
      .build();
    return this.timeSeriesService.getMeasurements(request).pipe(
      tap((response) => {
        console.log('tap');
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
              labelItems: ['Response Time'],
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

  onRangerSelectionChange(event: TimeRange) {
    // check for full range selection
    this.context.updateSelectedRange(event);
    // the linked charts are automatically updated by the uplot sync feature. if that will be replaced, the charts must subscribe to the state change
  }

  onRangerZoomReset() {
    this.context.resetZoom();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}
