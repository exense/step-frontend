import {
  AugmentedExecutionsService,
  AugmentedScreenService,
  CommonEntitiesUrlsService,
  Execution,
  ExecutionParameters,
  ExecutionParamsFactoryService,
  ExecutiontTaskParameters,
  IncludeTestcases,
  RepositoryObjectReference,
} from '@exense/step-core';
import { inject } from '@angular/core';
import { ExecutionTabManagerService } from '../../services/execution-tab-manager.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

export abstract class ExecutionCommandsBase {
  protected _executionService = inject(AugmentedExecutionsService);
  protected _executionTabManager = inject(ExecutionTabManagerService, { optional: true });
  protected _router = inject(Router);
  protected _commonEntitiesUrl = inject(CommonEntitiesUrlsService);
  protected _document = inject(DOCUMENT);
  protected _executionParamsFactory = inject(ExecutionParamsFactoryService);
  protected _screenTemplates = inject(AugmentedScreenService);

  abstract execution?: Execution;
  abstract description?: string;
  abstract repositoryObjectRef?: RepositoryObjectReference;
  abstract isolateExecution?: boolean;
  abstract includedTestcases?: IncludeTestcases | null;

  protected executionParameters?: Record<string, string>;
  protected isExecutionIsolated: boolean = false;

  protected abstract createTask(task: ExecutiontTaskParameters): void;
  protected abstract invokeRefresh(): void;

  execute(simulate: boolean): void {
    const currentEId = this.execution?.id;
    const executionParams = this.buildExecutionParams(simulate);
    this._executionService.execute(executionParams).subscribe((eId) => {
      if (currentEId && this._executionTabManager) {
        this._executionTabManager.handleTabClose(currentEId, false);
      }
      this._router.navigateByUrl(this._commonEntitiesUrl.executionUrl(eId, false));
    });
  }

  stop(): void {
    this._executionService.abort(this.execution!.id!).subscribe(() => this.invokeRefresh());
  }

  forceStop(): void {
    this._executionService.forceStop(this.execution!.id!).subscribe(() => this.invokeRefresh());
  }

  schedule(): void {
    const task = this.prefillScheduledTask();
    this.createTask(task);
  }

  copyExecutionServiceAsCurlToClipboard(): Promise<void> {
    const { location, navigator } = this._document.defaultView as Window;

    const hashIndex = location.href.indexOf('#');
    let url =
      hashIndex >= 0
        ? location.href.slice(0, hashIndex)
        : `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ''}`;

    url = url.endsWith('/') ? url : `${url}/`;
    url = `${url}rest/executions/start`;

    const payload = this.buildExecutionParams(false);
    const cmd = `curl -X POST ${url} -H 'Content-Type: application/json' -d '${JSON.stringify(payload)}'`;
    return navigator.clipboard.writeText(cmd);
  }

  protected setupExecutionParameters(execution?: Execution): void {
    if (execution) {
      const parameters = execution.executionParameters?.customParameters || {};
      this.executionParameters = { ...parameters };
      return;
    }
    this.loadDefaultExecutionParameters();
  }

  protected loadDefaultExecutionParameters(): void {
    this._screenTemplates.getDefaultParametersByScreenId('executionParameters').subscribe((parameters) => {
      this.executionParameters = parameters;
    });
  }

  protected setupIsolateExecution(execution?: Execution, isolateExecution?: boolean): void {
    this.isExecutionIsolated = isolateExecution ? true : execution?.executionParameters?.isolatedExecution || false;
  }

  private buildExecutionParams(simulate: boolean, includeUserId = true): ExecutionParameters {
    return this._executionParamsFactory.create({
      simulate,
      includeUserId,
      description: this.description,
      repositoryObject: this.repositoryObjectRef,
      isolatedExecution: this.isExecutionIsolated,
      includedTestCases: this.includedTestcases ?? undefined,
      customParameters: this.executionParameters,
    });
  }

  private prefillScheduledTask(): ExecutiontTaskParameters {
    const executionsParameters = this.buildExecutionParams(false, false);
    const name = executionsParameters.description ?? '';
    return {
      attributes: { name },
      executionsParameters,
    };
  }
}
