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
  FetchBucketsRequest,
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

  protected summaryInProgressInternal$ = new BehaviorSubject(false);
  readonly summaryInProgress$ = this.summaryInProgressInternal$.asObservable();

  readonly listInProgress$: Observable<boolean>;

  readonly summary$ = combineLatest([
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
    map((response) => this.protectedTimeSeriesResponse(response)),
  );

  readonly dateRange$ = this._executionState.timeRange$;

  ngOnDestroy(): void {
    this.summaryInProgressInternal$.complete();
  }

  protected abstract createFetchBucketRequest(execution: Execution, timeRange: TimeRange): FetchBucketsRequest;

  protected protectedTimeSeriesResponse(response?: TimeSeriesAPIResponse): ReportNodeSummary {
    if (!response) {
      return { total: 0 } as ReportNodeSummary;
    }

    return response.matrixKeys.reduce(
      (res: ReportNodeSummary, keyAttributes, i) => {
        const bucket = response.matrix[i][0];
        const status = keyAttributes['status'] as string;
        res[status] = bucket.count;
        res.total += bucket.count;
        return res;
      },
      { total: 0 },
    ) as ReportNodeSummary;
  }
}
