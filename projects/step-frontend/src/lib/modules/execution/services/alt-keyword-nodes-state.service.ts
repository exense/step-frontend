import { inject, Injectable, OnDestroy } from '@angular/core';
import { AltExecutionStateService } from './alt-execution-state.service';
import { AltReportNodesStateService } from './alt-report-nodes-state.service';
import { FetchBucketsRequest, TimeSeriesService } from '@exense/step-core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  of,
  combineLatest,
  map,
  tap,
  switchMap,
  catchError,
  finalize,
  filter,
} from 'rxjs';
import { ReportNodeSummary } from '../shared/report-node-summary';

@Injectable()
export class AltKeywordNodesStateService extends AltReportNodesStateService implements OnDestroy {
  constructor(_executionState: AltExecutionStateService) {
    super(_executionState.keywordsDataSource$, 'keywords');
  }

  private _timeSeriesService = inject(TimeSeriesService);

  private summaryInProgressInternal$ = new BehaviorSubject(false);
  override readonly summaryInProgress$ = this.summaryInProgressInternal$.pipe(distinctUntilChanged());

  override readonly summary$ = combineLatest([
    this._executionState.execution$,
    this._executionState.timeRange$.pipe(filter((range) => !!range)),
  ]).pipe(
    map(([execution, timeRange]) => {
      console.log('UPDATED');
      const request: FetchBucketsRequest = {
        start: timeRange!.from,
        end: timeRange!.to,
        numberOfBuckets: 1,
        oqlFilter: `(attributes.metricType = "response-time") and (attributes.eId = ${execution.id})`,
        groupDimensions: ['rnStatus'],
      };
      return request;
    }),
    tap(() => this.summaryInProgressInternal$.next(true)),
    switchMap((request) =>
      this._timeSeriesService.getTimeSeries(request).pipe(
        catchError(() => of(undefined)),
        finalize(() => this.summaryInProgressInternal$.next(false)),
      ),
    ),
    map((response) => {
      if (!response) {
        return { total: 0 } as ReportNodeSummary;
      }

      return response.matrixKeys.reduce(
        (res: ReportNodeSummary, keyAttributes, i) => {
          const bucket = response.matrix[i][0];
          const status = keyAttributes['rnStatus'] as string;
          res[status] = bucket.count;
          res.total += bucket.count;
          return res;
        },
        { total: 0 },
      ) as ReportNodeSummary;
    }),
  );

  ngOnDestroy(): void {
    this.summaryInProgressInternal$.complete();
  }
}
