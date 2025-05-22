import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import {
  AggregatedReport,
  AugmentedExecutionsService,
  DateUtilsService,
  Execution,
  TimeRangeSelection,
} from '@exense/step-core';
import { map, Observable, shareReplay, Subject, takeUntil, tap } from 'rxjs';

@Injectable()
export class AggregatedTreeDataLoaderService implements OnDestroy {
  private _executionsApi = inject(AugmentedExecutionsService);
  private _dateUtils = inject(DateUtilsService);

  private terminator$?: Subject<void>;
  private currentExecution?: Execution;
  private currentTimeRange?: TimeRangeSelection;
  private stream$?: Observable<AggregatedReport>;
  private previousRequestCounterInternal = signal(0);
  readonly previousRequestCounter = this.previousRequestCounterInternal.asReadonly();

  load(execution: Execution, timeRange: TimeRangeSelection): Observable<AggregatedReport> {
    if (this.stream$ && !this.needsToRecreateNewStream(execution, timeRange)) {
      this.previousRequestCounterInternal.update((value) => value + 1);
      this.currentExecution = execution;
      this.currentTimeRange = timeRange;
      return this.stream$;
    }
    this.previousRequestCounterInternal.set(0);
    this.terminate();
    this.terminator$ = new Subject<void>();
    this.currentExecution = execution;
    this.currentTimeRange = timeRange;

    this.stream$ = this.loadOperation(execution, timeRange).pipe(takeUntil(this.terminator$), shareReplay(1));

    return this.stream$;
  }

  ngOnDestroy(): void {
    this.terminate();
  }

  private terminate(): void {
    this.terminator$?.next?.();
    this.terminator$?.complete?.();
    this.terminator$ = undefined;
  }

  private needsToRecreateNewStream(execution: Execution, timeRange: TimeRangeSelection): boolean {
    if (
      this.currentExecution?.id !== execution.id ||
      (this.currentExecution?.status === 'RUNNING' && execution.status !== 'RUNNING')
    ) {
      return true;
    }

    if (!this.currentTimeRange) {
      return true;
    }

    if (this._dateUtils.areTimeRangeSelectionsEquals(this.currentTimeRange, timeRange)) {
      return false;
    }

    return true;
  }

  private loadOperation(execution: Execution, timeRange: TimeRangeSelection): Observable<AggregatedReport> {
    const operation$ =
      timeRange.type === 'FULL'
        ? this._executionsApi.getFullAggregatedReportView(execution.id!)
        : this._executionsApi.getAggregatedReportView(execution.id!, { range: timeRange.absoluteSelection! });

    return operation$.pipe(
      map((response) => response ?? {}),
      tap(() => (this.stream$ = undefined)),
    );
  }
}
