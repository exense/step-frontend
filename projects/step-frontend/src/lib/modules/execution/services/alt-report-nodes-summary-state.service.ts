import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import {
  Execution,
  ExecutionSummaryDto,
  FetchBucketsRequest,
  PrivateViewPluginService,
  smartSwitchMap,
  TableDataSource,
  TimeRange,
  TimeRangeSelection,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { ReportNodeSummary } from '../shared/report-node-summary';
import { convertPickerSelectionToTimeRange } from '../shared/convert-picker-selection';
import { AltReportNodesStateService } from './alt-report-nodes-state.service';
import { AltExecutionRefreshActivity } from '../shared/alt-execution-refresh-activity.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionRefreshActivityService } from './alt-execution-refresh-activity.service';

@Injectable()
export abstract class AltReportNodesSummaryStateService<T> extends AltReportNodesStateService<T> implements OnDestroy {
  /* eslint-disable @angular-eslint/prefer-inject */
  protected constructor(
    datasource$: Observable<TableDataSource<T>>,
    storagePrefix: string,
    refreshActivity: AltExecutionRefreshActivity,
  ) {
    super(datasource$, storagePrefix);
    this.summary$ = this.setupSummaryStream(refreshActivity);
  }
  /* eslint-enable @angular-eslint/prefer-inject */

  private _timeSeriesService = inject(TimeSeriesService);
  private _viewService = inject(PrivateViewPluginService);
  private _refreshActivityService = inject(AltExecutionRefreshActivityService);

  private isFullRangeSelection$ = this._executionState.timeRangeSelection$.pipe(
    map((rangeSelection) => rangeSelection.type === 'FULL'),
  );

  protected abstract readonly statusDistributionViewId: string;
  protected summaryInProgressInternal$ = new BehaviorSubject(false);
  protected summaryDisplayInProgressInternal$ = new BehaviorSubject(false);
  readonly summaryInProgress$ = this.summaryInProgressInternal$.asObservable();
  readonly summaryDisplayInProgress$ = this.summaryDisplayInProgressInternal$.asObservable();

  readonly summary$: Observable<ReportNodeSummary>;
  private initialSummaryLoadPending = true;
  private previousSummaryProgressExecutionId?: string;
  private previousSummaryProgressRange?: TimeRangeSelection;

  ngOnDestroy(): void {
    this.summaryInProgressInternal$.complete();
    this.summaryDisplayInProgressInternal$.complete();
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

  private setupSummaryStream(refreshActivity: AltExecutionRefreshActivity): Observable<ReportNodeSummary> {
    const isActive$ = this._refreshActivityService.isActive$(refreshActivity);

    const forecastSummaryTotal$ = combineLatest([
      isActive$,
      this._executionState.execution$,
      this.isFullRangeSelection$,
    ]).pipe(
      filter(([isActive]) => isActive),
      switchMap(([, execution, isFullRangeSelected]) => {
        if (execution.status !== 'RUNNING' || !isFullRangeSelected) {
          return of(undefined);
        }
        return this._viewService
          .getView(this.statusDistributionViewId, execution.id!)
          .pipe(map((status) => status as ExecutionSummaryDto));
      }),
      map((summary) => summary?.countForecast),
    );

    const summaryTimeSeries$ = combineLatest([
      isActive$,
      this._executionState.execution$,
      this._executionState.timeRangeSelection$,
    ]).pipe(
      filter(([isActive]) => isActive),
      map(([, execution, range]) => ({ execution, range })),
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
          const displayProgress = this.shouldDisplayProgress(execution, range);
          this.summaryInProgressInternal$.next(true);
          if (displayProgress) {
            this.summaryDisplayInProgressInternal$.next(true);
          }
          return this._timeSeriesService.getReportNodesTimeSeries(bucketRequest).pipe(
            catchError(() => of(undefined)),
            finalize(() => {
              this.summaryInProgressInternal$.next(false);
              if (displayProgress) {
                this.summaryDisplayInProgressInternal$.next(false);
              }
            }),
          );
        },
        this._destroyRef,
      ),
    );

    return combineLatest([summaryTimeSeries$, forecastSummaryTotal$]).pipe(
      map(([summaryTimeSeries, countForecast]) => this.protectedTimeSeriesResponse(summaryTimeSeries, countForecast)),
      shareReplay(1),
      takeUntilDestroyed(this._destroyRef),
    );
  }

  private shouldDisplayProgress(execution: Execution, range: TimeRangeSelection): boolean {
    const displayProgress =
      this.initialSummaryLoadPending ||
      this.previousSummaryProgressExecutionId !== execution.id ||
      !this._dateUtils.areTimeRangeSelectionsEquals(this.previousSummaryProgressRange, range);

    this.initialSummaryLoadPending = false;
    this.previousSummaryProgressExecutionId = execution.id;
    this.previousSummaryProgressRange = range;

    return displayProgress;
  }
}
