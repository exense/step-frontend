import { inject, Injectable } from '@angular/core';
import { ActiveExecution, ActiveExecutionsService } from './active-executions.service';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Execution } from '@exense/step-core';

@Injectable()
export class ActiveExecutionContextService {
  private _activeExecutionsService = inject(ActiveExecutionsService);

  private executionIdInternal$ = new BehaviorSubject<string>('');

  readonly executionId$: Observable<string> = this.executionIdInternal$.pipe(
    filter((id) => !!id),
    distinctUntilChanged((a, b) => a === b),
    takeUntilDestroyed(),
  );

  readonly activeExecution$: Observable<ActiveExecution> = this.executionId$.pipe(
    map((id) => this._activeExecutionsService.getActiveExecution(id)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly execution$: Observable<Execution> = this.executionId$.pipe(
    map((id) => this._activeExecutionsService.getActiveExecution(id)),
    switchMap((activeExecution) => activeExecution?.execution$ ?? of(undefined)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  manualRefresh(): void {
    const executionId = this.executionIdInternal$.value;
    this._activeExecutionsService.getActiveExecution(executionId)?.manualRefresh();
  }

  setupExecutionId(executionId: string): void {
    this.executionIdInternal$.next(executionId);
  }
}
