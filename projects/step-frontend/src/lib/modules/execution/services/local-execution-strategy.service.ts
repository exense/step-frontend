import { inject, Injectable, signal } from '@angular/core';
import {
  AugmentedExecutionsService,
  AugmentedScreenService,
  ExecutionParameters,
  ExecutionParamsFactoryService,
  ExecutionCommandsContext,
  ALL_EXECUTION_ACTIONS_AVAILABLE,
  ExecutionActionAvailability,
  ExecutionLaunchResult,
  ExecutionStrategy,
  RepositoryObjectReference,
} from '@exense/step-core';
import { map, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocalExecutionStrategyService implements ExecutionStrategy {
  private readonly _executionService = inject(AugmentedExecutionsService);
  private readonly _screensService = inject(AugmentedScreenService);
  private readonly _executionParamsFactory = inject(ExecutionParamsFactoryService);

  readonly availability = signal<ExecutionActionAvailability>(ALL_EXECUTION_ACTIONS_AVAILABLE).asReadonly();
  readonly showTestcases = signal(true).asReadonly();

  execute(context: ExecutionCommandsContext, options: { simulate: boolean }): Observable<ExecutionLaunchResult> {
    return this.buildExecutionParams(context, options).pipe(
      switchMap((executionParameters) => this._executionService.execute(executionParameters)),
      map((executionId) => ({ kind: 'LOCAL' as const, executionId })),
    );
  }

  buildExecutionParams(
    context: ExecutionCommandsContext,
    options: { simulate: boolean; includeUserId?: boolean },
  ): Observable<ExecutionParameters> {
    const customForms = context.getCustomForms();
    const isReady$ = !customForms ? of(undefined) : customForms.readyToProceed();
    return isReady$.pipe(
      switchMap(() =>
        this._screensService.filterInactiveParameters('executionParameters', context.getExecutionParameters()),
      ),
      map((customParameters) =>
        this._executionParamsFactory.create({
          simulate: options.simulate,
          includeUserId: options.includeUserId ?? true,
          description: context.getDescription(),
          repositoryObject: this.cloneRepositoryObjectRef(context),
          isolatedExecution: context.getIsExecutionIsolated(),
          includedTestCases: context.getIncludedTestcases() ?? undefined,
          customParameters,
        }),
      ),
    );
  }

  private cloneRepositoryObjectRef(context: ExecutionCommandsContext): RepositoryObjectReference | undefined {
    const repositoryObjectRef = context.getRepositoryObjectRef();
    if (!repositoryObjectRef) {
      return undefined;
    }
    const { repositoryID, repositoryParameters } = repositoryObjectRef;
    return {
      repositoryID,
      repositoryParameters: repositoryParameters ? { ...repositoryParameters } : undefined,
    };
  }
}
