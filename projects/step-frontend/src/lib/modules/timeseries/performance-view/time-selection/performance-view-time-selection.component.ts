import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeSeriesUtils } from '../../time-series-utils';
import { TSRangerComponent } from '../../ranger/ts-ranger.component';
import { TSTimeRange } from '../../chart/model/ts-time-range';
import { TimeSeriesContext } from '../../time-series-context';
import { TimeSeriesConfig } from '../../time-series.config';
import { TSRangerSettings } from '../../ranger/ts-ranger-settings';
import { TimeSeriesContextsFactory } from '../../time-series-contexts-factory.service';
import { PerformanceViewSettings } from '../model/performance-view-settings';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { TimeSeriesAPIResponse, TimeSeriesService } from '@exense/step-core';
import { FilterUtils } from '../../util/filter-utils';
import { FindBucketsRequestBuilder } from '../../util/find-buckets-request-builder';
import { PerformanceViewComponent } from '../performance-view.component';

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
      .onTimeSelectionChange()
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

  refreshRanger(): Observable<TimeSeriesAPIResponse> {
    const selection = this.tsContext.getSelectedTimeRange();
    return this.createRanger(
      this.tsContext.getFullTimeRange(),
      this.tsContext.isFullRangeSelected() ? undefined : selection
    );
  }

  createRanger(fullTimeRange: TSTimeRange, selection?: TSTimeRange): Observable<TimeSeriesAPIResponse> {
    const request = new FindBucketsRequestBuilder()
      .withRange(fullTimeRange)
      .addAttribute(TimeSeriesConfig.METRIC_TYPE_KEY, TimeSeriesConfig.METRIC_TYPE_RESPONSE_TIME)
      .withFilteringSettings(this.tsContext.getFilteringSettings())
      .withNumberOfBuckets(TimeSeriesConfig.MAX_BUCKETS_IN_CHART)
      .withFilterAttributesMask(TimeSeriesConfig.RANGER_FILTER_FIELDS)
      .withSkipCustomOQL(true)
      .build();
    return this.timeSeriesService.getBuckets(request).pipe(
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
