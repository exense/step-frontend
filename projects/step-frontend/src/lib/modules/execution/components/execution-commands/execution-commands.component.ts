import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  AugmentedExecutionsService,
  AugmentedScreenService,
  CommonEntitiesUrlsService,
  Execution,
  ExecutionParameters,
  ExecutionParamsFactoryService,
  ExecutiontTaskParameters,
  RepositoryObjectReference,
  IncludeTestcases,
} from '@exense/step-core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { ExecutionTabManagerService } from '../../services/execution-tab-manager.service';

@Component({
  selector: 'step-execution-commands',
  templateUrl: './execution-commands.component.html',
  styleUrls: ['./execution-commands.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ExecutionCommandsComponent implements OnInit, OnChanges {
  private _executionTabManager = inject(ExecutionTabManagerService, { optional: true });
  private _executionParamsFactory = inject(ExecutionParamsFactoryService);
  private _router = inject(Router);
  private _commonEntitiesUrl = inject(CommonEntitiesUrlsService);
  private _executionService = inject(AugmentedExecutionsService);
  private _screenTemplates = inject(AugmentedScreenService);
  private _document = inject(DOCUMENT);

  @Input() description?: string;
  @Input() repositoryObjectRef?: RepositoryObjectReference;
  @Input() isolateExecution?: boolean;
  @Input() includedTestcases?: IncludeTestcases | null;
  @Input() execution?: Execution;
  @Input() displayParametersForm = true;

  @Output() refresh = new EventEmitter<void>();
  @Output() scheduleTask = new EventEmitter<ExecutiontTaskParameters>();

  executionParameters?: Record<string, string>;
  isExecutionIsolated: boolean = false;

  ngOnInit(): void {
    if (!this.executionParameters) {
      this.loadDefaultExecutionParameters();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    let execution: Execution | undefined | null = null;
    let isolateExecution: boolean | undefined | null = null;

    const cExecution = changes['execution'];
    const cIsolateExecution = changes['isolateExecution'];

    if (cExecution?.previousValue !== cExecution?.currentValue || cExecution?.firstChange) {
      execution = cExecution?.currentValue;
    }

    if (cIsolateExecution?.previousValue !== cIsolateExecution?.currentValue || cIsolateExecution?.firstChange) {
      isolateExecution = cIsolateExecution?.currentValue;
    }

    if (execution !== null) {
      this.setupExecutionParameters(execution!);
    }

    if (execution !== null || isolateExecution !== null) {
      this.setupIsolateExecution(execution!, isolateExecution!);
    }
  }

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
    this._executionService.abort(this.execution!.id!).subscribe(() => this.refresh.emit());
  }

  forceStop(): void {
    this._executionService.forceStop(this.execution!.id!).subscribe(() => this.refresh.emit());
  }

  schedule(): void {
    const task = this.prefillScheduledTask();
    this.scheduleTask.emit(task);
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

  private setupExecutionParameters(execution?: Execution): void {
    if (execution) {
      const parameters = execution.executionParameters?.customParameters || {};
      this.executionParameters = { ...parameters };
      return;
    }
    this.loadDefaultExecutionParameters();
  }

  private loadDefaultExecutionParameters(): void {
    this._screenTemplates.getDefaultParametersByScreenId('executionParameters').subscribe((parameters) => {
      this.executionParameters = parameters;
    });
  }

  private setupIsolateExecution(execution?: Execution, isolateExecution?: boolean): void {
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
