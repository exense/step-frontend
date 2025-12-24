import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  input,
  Input,
  OnInit,
  Output,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TimeRange, TimeSeriesAPIResponse, TimeSeriesService } from '@exense/step-core';
import {
  COMMON_IMPORTS,
  TimeSeriesConfig,
  TimeSeriesContext,
  TimeSeriesUtils,
  TsFilteringSettings,
} from '../../../_common';
import { TSRangerSettings } from '../ranger/ts-ranger-settings';
import { TSRangerComponent } from '../ranger/ts-ranger.component';
import { FindBucketsRequestBuilder } from '../../types/find-buckets-request-builder';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { sign } from 'chart.js/helpers';

@Component({
  selector: 'step-execution-time-selection',
  templateUrl: './performance-view-time-selection.component.html',
  styleUrls: ['./performance-view-time-selection.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [COMMON_IMPORTS, TSRangerComponent],
  standalone: true,
})
export class PerformanceViewTimeSelectionComponent implements OnInit {
  @Input() context!: TimeSeriesContext;
  showSpinnerWhileLoading = input<boolean>(false);

  @Output() rangerLoaded = new EventEmitter<void>();

  rangerSettings: TSRangerSettings | undefined;
  @ViewChild(TSRangerComponent) rangerComponent!: TSRangerComponent;

  timeLabels: number[] = [];

  private _timeSeriesService = inject(TimeSeriesService);
  private _destroyRef = inject(DestroyRef);

  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    if (!this.context) {
      throw new Error('Context input is required');
    }
    this.createRanger(this.context).subscribe(() => this.rangerLoaded.next());
    this.context
      .onTimeSelectionChange()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((selection) => {
        if (this.context.isFullRangeSelected()) {
          this.rangerComponent.resetSelect();
        } else {
          this.rangerComponent.selectRange(selection);
        }
      });
    this.context
      .onFullRangeChange()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((range) => {
        // this.settings.timeRange = range;
        this.createRanger(this.context).subscribe();
      });
  }

  refreshRanger(): Observable<TimeSeriesAPIResponse> {
    return this.createRanger(this.context);
  }

  createRanger(context: TimeSeriesContext): Observable<TimeSeriesAPIResponse> {
    this.isLoading.set(true);
    const customFiltering = JSON.parse(JSON.stringify(this.context.getFilteringSettings())) as TsFilteringSettings;
    customFiltering.filterItems = []; // ignore visible filters.
    const request = new FindBucketsRequestBuilder()
      .withRange(context.getFullTimeRange())
      .addAttribute(TimeSeriesConfig.METRIC_TYPE_KEY, TimeSeriesConfig.METRIC_TYPE_RESPONSE_TIME)
      .withFilteringSettings(customFiltering)
      .withNumberOfBuckets(TimeSeriesConfig.MAX_BUCKETS_IN_CHART)
      .withFilterAttributesMask(TimeSeriesConfig.RANGER_FILTER_FIELDS)
      .withSkipCustomOQL(true)
      .build();
    return this._timeSeriesService.getTimeSeries(request).pipe(
      tap((response) => {
        this.timeLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
        let avgData: (number | null)[] = [];
        if (response.matrix[0]) {
          avgData = response.matrix[0].map((b) => b?.throughputPerHour || 0);
        }
        const customSelection = context.isFullRangeSelected() ? undefined : context.getSelectedTimeRange();
        this.rangerSettings = {
          xValues: this.timeLabels,
          selection: customSelection,
          series: [
            {
              id: 'avg',
              label: 'Response Time',
              labelItems: ['Response Time'],
              data: avgData,
              // value: (self, x) => Math.trunc(x) + ' ms',
              legendName: 'Ranger',
            },
          ],
        };
        this.isLoading.set(false);
      }),
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
}
