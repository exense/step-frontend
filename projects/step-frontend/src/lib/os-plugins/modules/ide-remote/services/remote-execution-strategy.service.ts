import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ExecutionActionAvailability,
  ExecutionCommandsContext,
  ExecutionLaunchDashletContext,
  ExecutionLaunchResult,
  ExecutionStrategy,
  IDE_MODE,
  IdeStateStrategyService,
  RemoteExecution,
} from '@exense/step-core';
import { catchError, EMPTY, finalize, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { IdeRemoteApiService } from './ide-remote-api.service';
import { IdeRemoteDefaultsService } from './ide-remote-defaults.service';

@Injectable()
export class RemoteExecutionStrategyService implements ExecutionStrategy {
  private readonly _ideMode = inject(IDE_MODE);
  private readonly _ideState = inject(IdeStateStrategyService);
  private readonly _defaults = inject(IdeRemoteDefaultsService);
  private readonly _api = inject(IdeRemoteApiService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly launchContext = signal<ExecutionLaunchDashletContext | undefined>(undefined);

  readonly busy = signal(false);
  readonly results = signal<RemoteExecution[] | undefined>(undefined);
  readonly submissionError = signal<string | undefined>(undefined);
  readonly readinessError = computed(() => this.getPrerequisiteError());
  readonly availability = computed<ExecutionActionAvailability>(() => {
    const readinessError = this.readinessError();
    const busy = this.busy();
    return {
      execute: !readinessError && !busy,
      simulate: false,
      copyRequest: false,
      schedule: false,
    };
  });
  readonly showTestcases = signal(false).asReadonly();

  configure(context: ExecutionLaunchDashletContext): void {
    this.launchContext.set(context);
  }

  execute(context: ExecutionCommandsContext, options: { simulate: boolean }): Observable<ExecutionLaunchResult> {
    if (options.simulate) {
      this.submissionError.set('Remote simulation is unavailable.');
      return EMPTY;
    }

    const error = this.getPrerequisiteError();
    if (this.busy() || error) {
      return EMPTY;
    }

    this.busy.set(true);
    this.results.set(undefined);
    this.submissionError.set(undefined);

    const customForms = context.getCustomForms();
    const ready$ = customForms ? customForms.readyToProceed() : of(undefined);
    return ready$.pipe(
      take(1),
      switchMap(() => {
        const readinessError = this.getPrerequisiteError();
        const executionDefaults = this._defaults.getExecutionRequest();
        const selectedPlanName = this.launchContext()?.planName();
        if (readinessError || !executionDefaults || !selectedPlanName?.trim()) {
          return EMPTY;
        }

        return this._api.executeRemote({
          ...executionDefaults,
          includePlans: [selectedPlanName],
          executionParameters: {
            ...executionDefaults.executionParameters,
            ...context.getExecutionParameters(),
          },
        });
      }),
      tap((results) => this.results.set(results ?? [])),
      map(() => ({ kind: 'HANDLED' as const, showResults: true })),
      catchError(() => {
        this.submissionError.set('Remote execution failed. Check the error details and try again.');
        return EMPTY;
      }),
      finalize(() => this.busy.set(false)),
      takeUntilDestroyed(this._destroyRef),
    );
  }

  private getPrerequisiteError(): string | undefined {
    const launchContext = this.launchContext();
    const currentPackage = this._ideState.currentPackage();
    const inProgress = this._ideState.inProgress();
    const defaultsError = this._defaults.getOperationError('execute');
    const planName = launchContext?.planName();
    const ready = launchContext?.ready();

    if (!this._ideMode || !launchContext?.allowExecutionTargetSelection) {
      return 'Remote plan execution is unavailable in this dialog.';
    }
    if (!ready || !planName?.trim()) {
      return 'Wait for the plan to finish loading.';
    }
    if (inProgress) {
      return 'Wait for the automation package operation to finish.';
    }
    if (!currentPackage) {
      return 'Open an automation package before executing remotely.';
    }
    return defaultsError;
  }
}
