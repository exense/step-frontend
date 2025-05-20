import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  Execution,
  ExecutionSummaryDto,
  FetchBucketsRequest,
  PrivateViewPluginService,
  TableDataSource,
  TimeRange,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { ReportNodeSummary } from '../shared/report-node-summary';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltReportNodesFilterService } from './alt-report-nodes-filter.service';

@Injectable()
export abstract class AltReportNodesStateService<T> extends AltReportNodesFilterService implements OnDestroy {
  protected constructor(
    readonly datasource$: Observable<TableDataSource<T>>,
    storagePrefix: string,
  ) {
    super(storagePrefix);
    this.listInProgress$ = datasource$.pipe(
      switchMap((dataSource) => dataSource.inProgress$),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    );
  }

  private _timeSeriesService = inject(TimeSeriesService);
  private _viewService = inject(PrivateViewPluginService);

  private isFullRangeSelection$ = this._executionState.timeRangeSelection$.pipe(
    map((rangeSelection) => rangeSelection.type === 'FULL'),
  );

  protected abstract readonly statusDistributionViewId: string;
  protected summaryInProgressInternal$ = new BehaviorSubject(false);
  readonly summaryInProgress$ = this.summaryInProgressInternal$.asObservable();

  readonly listInProgress$: Observable<boolean>;

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
    this._executionState.timeRange$.pipe(filter((range) => !!range)),
  ]).pipe(
    map(([execution, timeRange]) => this.createFetchBucketRequest(execution, timeRange!)),
    tap(() => this.summaryInProgressInternal$.next(true)),
    switchMap((request) =>
      this._timeSeriesService.getReportNodesTimeSeries(request).pipe(
        catchError(() => of(undefined)),
        finalize(() => this.summaryInProgressInternal$.next(false)),
      ),
    ),
  );

  readonly summary$ = combineLatest([this.summaryTimeSeries$, this.forecastSummaryTotal$]).pipe(
    map(([summaryTimeSeries, countForecast]) => this.protectedTimeSeriesResponse(summaryTimeSeries, countForecast)),
  );

  readonly dateRange$ = this._executionState.timeRange$;

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
