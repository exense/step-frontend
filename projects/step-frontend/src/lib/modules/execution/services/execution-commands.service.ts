import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { EMPTY, from, map, Observable, switchMap } from 'rxjs';
import {
  AugmentedExecutionsService,
  CommonEntitiesUrlsService,
  ExecutiontTaskParameters,
  ExecutionCommandsContext,
  ExecutionStrategy,
  ExecutionStrategyController,
} from '@exense/step-core';
import { DOCUMENT } from '@angular/common';
import { ExecutionTabManagerService } from './execution-tab-manager.service';
import { Router } from '@angular/router';
import { LocalExecutionStrategyService } from './local-execution-strategy.service';

@Injectable()
export class ExecutionCommandsService implements OnDestroy, ExecutionStrategyController {
  private _executionTabManager = inject(ExecutionTabManagerService, { optional: true });
  private _executionService = inject(AugmentedExecutionsService);
  private _localStrategy = inject(LocalExecutionStrategyService);
  private _document = inject(DOCUMENT);
  private _router = inject(Router);
  private _commonEntitiesUrl = inject(CommonEntitiesUrlsService);

  private contextInternal?: ExecutionCommandsContext;
  private readonly selectedStrategyInternal = signal<ExecutionStrategy>(this._localStrategy);

  readonly selectedStrategy = this.selectedStrategyInternal.asReadonly();
  readonly availability = computed(() => {
    const strategy = this.selectedStrategy();
    return strategy.availability();
  });
  readonly showTestcases = computed(() => {
    const strategy = this.selectedStrategy();
    return strategy.showTestcases();
  });

  ngOnDestroy(): void {
    this.contextInternal = undefined;
  }

  useContext(context: ExecutionCommandsContext): this {
    this.contextInternal = context;
    return this;
  }

  selectStrategy(strategy: ExecutionStrategy): void {
    this.selectedStrategyInternal.set(strategy);
  }

  restoreLocalStrategy(): void {
    this.selectedStrategyInternal.set(this._localStrategy);
  }

  execute(simulate: boolean): void {
    const strategy = this.selectedStrategy();
    const availability = strategy.availability();
    if (!(simulate ? availability.simulate : availability.execute)) {
      return;
    }

    const currentEId = this.context.getExecution()?.id;
    strategy.execute(this.context, { simulate }).subscribe((result) => {
      if (result.kind === 'LOCAL') {
        if (currentEId && this._executionTabManager) {
          this._executionTabManager.handleTabClose(currentEId, false);
        }
        this._router.navigateByUrl(this._commonEntitiesUrl.executionUrl(result.executionId, false));
      }
    });
  }

  stop(): Observable<void> {
    return this._executionService.abort(this.context.getExecution()!.id!);
  }

  forceStop(): Observable<void> {
    return this._executionService.forceStop(this.context.getExecution()!.id!);
  }

  copyExecutionServiceAsCurlToClipboard(): void {
    if (!this.availability().copyRequest) {
      return;
    }

    const { location, navigator } = this._document.defaultView as Window;

    const hashIndex = location.href.indexOf('#');
    let url =
      hashIndex >= 0
        ? location.href.slice(0, hashIndex)
        : `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ''}`;

    url = url.endsWith('/') ? url : `${url}/`;
    url = `${url}rest/executions/start`;

    this._localStrategy
      .buildExecutionParams(this.context, { simulate: false, includeUserId: false })
      .pipe(
        map(
          (payload) =>
            `curl -X POST ${url} -H 'Authorization: Bearer <REPLACE_WITH_YOUR_API_KEY>' -H 'Content-Type: application/json' -d '${JSON.stringify(payload)}'`,
        ),
        switchMap((cmd) => from(navigator.clipboard.writeText(cmd))),
      )
      .subscribe();
  }

  prefillScheduledTask(): Observable<ExecutiontTaskParameters> {
    if (!this.availability().schedule) {
      return EMPTY;
    }

    const executionsParameters$ = this._localStrategy.buildExecutionParams(this.context, {
      simulate: false,
      includeUserId: false,
    });
    return executionsParameters$.pipe(
      map((executionsParameters) => {
        const name = executionsParameters.description ?? '';
        return {
          attributes: { name },
          executionsParameters,
          active: true,
        };
      }),
    );
  }

  private get context(): ExecutionCommandsContext {
    if (!this.contextInternal) {
      throw new Error('Execution context not set');
    }
    return this.contextInternal;
  }
}
