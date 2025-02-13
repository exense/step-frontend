import { inject, Injectable } from '@angular/core';
import { ActiveExecutionsService } from './active-executions.service';
import { BehaviorSubject, filter, map, of, shareReplay, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class ActiveExecutionContextService {
  private _activeExecutions = inject(ActiveExecutionsService);

  private executionIdInternal$ = new BehaviorSubject<string>('');

  readonly executionId$ = this.executionIdInternal$.pipe(
    filter((id) => !!id),
    takeUntilDestroyed(),
  );

  readonly activeExecution$ = this.executionId$.pipe(
    map((id) => this._activeExecutions.getActiveExecution(id)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly execution$ = this.executionId$.pipe(
    map((id) => this._activeExecutions.getActiveExecution(id)),
    switchMap((activeExecution) => activeExecution?.execution$ ?? of(undefined)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  manualRefresh(): void {
    const executionId = this.executionIdInternal$.value;
    this._activeExecutions.getActiveExecution(executionId)?.manualRefresh();
  }

  setupExecutionId(executionId: string): void {
    this.executionIdInternal$.next(executionId);
  }
}
