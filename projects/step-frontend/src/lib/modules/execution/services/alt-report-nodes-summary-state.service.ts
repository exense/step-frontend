import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, finalize, map, Observable, of, switchMap } from 'rxjs';
import {
  Execution,
  ExecutionSummaryDto,
  FetchBucketsRequest,
  PrivateViewPluginService,
  smartSwitchMap,
  TableDataSource,
  TimeRange,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { ReportNodeSummary } from '../shared/report-node-summary';
import { convertPickerSelectionToTimeRange } from '../shared/convert-picker-selection';
import { AltReportNodesStateService } from './alt-report-nodes-state.service';

@Injectable()
export abstract class AltReportNodesSummaryStateService<T> extends AltReportNodesStateService<T> implements OnDestroy {
  // eslint-disable-next-line @angular-eslint/prefer-inject
  protected constructor(datasource$: Observable<TableDataSource<T>>, storagePrefix: string) {
    super(datasource$, storagePrefix);
  }

  private _timeSeriesService = inject(TimeSeriesService);
  private _viewService = inject(PrivateViewPluginService);

  private isFullRangeSelection$ = this._executionState.timeRangeSelection$.pipe(
    map((rangeSelection) => rangeSelection.type === 'FULL'),
  );

  protected abstract readonly statusDistributionViewId: string;
  protected summaryInProgressInternal$ = new BehaviorSubject(false);
  readonly summaryInProgress$ = this.summaryInProgressInternal$.asObservable();

  private forecastSummaryTotal$ = combineLatest([this._executionState.execution$, this.isFullRangeSelection$]).pipe(
    switchMap(([execution, isFullRangeSelected]) => {
      if (execution.status !== 'RUNNING' || !isFullRangeSelected) {
        return of(undefined);
      }
      return this._viewService
        .getView(this.statusDistributionViewId, execution.id!)
        .pipe(map((status) => status as ExecutionSummaryDto));
    }),
    map((summary) => summary?.countForecast),
  );

  private summaryTimeSeries$ = combineLatest([
    this._executionState.execution$,
    this._executionState.timeRangeSelection$,
  ]).pipe(
    map(([execution, range]) => ({ execution, range })),
    smartSwitchMap(
      (curr, prev) => {
        return (
          curr.execution?.id !== prev?.execution?.id ||
          !this._dateUtils.areTimeRangeSelectionsEquals(curr.range, prev?.range)
        );
      },
      ({ execution, range }) => {
        const timeRange = convertPickerSelectionToTimeRange(range, execution, this._executionId());
        if (!timeRange) {
          return of(undefined);
        }
        const bucketRequest = this.createFetchBucketRequest(execution, timeRange);
        this.summaryInProgressInternal$.next(true);
        return this._timeSeriesService.getReportNodesTimeSeries(bucketRequest).pipe(
          catchError(() => of(undefined)),
          finalize(() => this.summaryInProgressInternal$.next(false)),
        );
      },
      this._destroyRef,
    ),
  );

  readonly summary$ = combineLatest([this.summaryTimeSeries$, this.forecastSummaryTotal$]).pipe(
    map(([summaryTimeSeries, countForecast]) => this.protectedTimeSeriesResponse(summaryTimeSeries, countForecast)),
  );

  ngOnDestroy(): void {
    this.summaryInProgressInternal$.complete();
  }

  protected abstract createFetchBucketRequest(execution: Execution, timeRange: TimeRange): FetchBucketsRequest;

  protected protectedTimeSeriesResponse(response?: TimeSeriesAPIResponse, countForecast?: number): ReportNodeSummary {
    if (!response) {
      return { total: 0, items: {} } as ReportNodeSummary;
    }

    return response.matrixKeys.reduce(
      (res: ReportNodeSummary, keyAttributes, i) => {
        const bucket = response.matrix[i][0];
        const status = keyAttributes['status'] as string;
        res.items[status] = bucket.count;
        res.total += bucket.count;
        return res;
      },
      { total: 0, countForecast, items: {} },
    ) as ReportNodeSummary;
  }
}
