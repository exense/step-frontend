import { inject, Injectable, OnDestroy } from '@angular/core';
import { ExecutionCommandsContext } from '../shared/execution-commands-context.interface';
import { from, map, Observable, of, switchMap } from 'rxjs';
import {
  AugmentedExecutionsService,
  CommonEntitiesUrlsService,
  ExecutionParameters,
  ExecutionParamsFactoryService,
  ExecutiontTaskParameters,
  RepositoryObjectReference,
} from '@exense/step-core';
import { DOCUMENT } from '@angular/common';
import { ExecutionTabManagerService } from './execution-tab-manager.service';
import { Router } from '@angular/router';

@Injectable()
export class ExecutionCommandsService implements OnDestroy {
  private _executionTabManager = inject(ExecutionTabManagerService, { optional: true });
  private _executionService = inject(AugmentedExecutionsService);
  private _executionParamsFactory = inject(ExecutionParamsFactoryService);
  private _document = inject(DOCUMENT);
  private _router = inject(Router);
  private _commonEntitiesUrl = inject(CommonEntitiesUrlsService);

  private contextInternal?: ExecutionCommandsContext;

  ngOnDestroy(): void {
    this.contextInternal = undefined;
  }

  useContext(context: ExecutionCommandsContext): this {
    this.contextInternal = context;
    return this;
  }

  execute(simulate: boolean): void {
    const currentEId = this.context.getExecution()?.id;
    this.buildExecutionParams(simulate)
      .pipe(switchMap((executionParameters) => this._executionService.execute(executionParameters)))
      .subscribe((eId) => {
        if (currentEId && this._executionTabManager) {
          this._executionTabManager.handleTabClose(currentEId, false);
        }
        this._router.navigateByUrl(this._commonEntitiesUrl.executionUrl(eId, false));
      });
  }

  stop(): Observable<void> {
    return this._executionService.abort(this.context.getExecution()!.id!);
  }

  forceStop(): Observable<void> {
    return this._executionService.forceStop(this.context.getExecution()!.id!);
  }

  copyExecutionServiceAsCurlToClipboard(): void {
    const { location, navigator } = this._document.defaultView as Window;

    const hashIndex = location.href.indexOf('#');
    let url =
      hashIndex >= 0
        ? location.href.slice(0, hashIndex)
        : `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ''}`;

    url = url.endsWith('/') ? url : `${url}/`;
    url = `${url}rest/executions/start`;

    this.buildExecutionParams(false, false)
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
    const executionsParameters$ = this.buildExecutionParams(false, false);
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

  private buildExecutionParams(simulate: boolean, includeUserId = true): Observable<ExecutionParameters> {
    const customForms = this.context.getCustomForms();
    const isReady$ = !customForms ? of(undefined) : customForms.readyToProceed();
    return isReady$.pipe(
      map(() =>
        this._executionParamsFactory.create({
          simulate,
          includeUserId,
          description: this.context.getDescription(),
          repositoryObject: this.cloneRepositoryObjectRef(),
          isolatedExecution: this.context.getIsExecutionIsolated(),
          includedTestCases: this.context.getIncludedTestcases() ?? undefined,
          customParameters: this.context.getExecutionParameters(),
        }),
      ),
    );
  }

  private cloneRepositoryObjectRef(): RepositoryObjectReference | undefined {
    const repositoryObjectRef = this.context.getRepositoryObjectRef();
    if (!repositoryObjectRef) {
      return undefined;
    }
    const { repositoryID, repositoryParameters } = repositoryObjectRef;
    return {
      repositoryID,
      repositoryParameters: repositoryParameters ? { ...repositoryParameters } : undefined,
    };
  }

  private get context(): ExecutionCommandsContext {
    if (!this.contextInternal) {
      throw new Error('Execution context not set');
    }
    return this.contextInternal;
  }
}
