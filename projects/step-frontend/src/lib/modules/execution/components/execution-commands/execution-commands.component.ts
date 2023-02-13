import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  AJS_LOCATION,
  AJS_MODULE,
  AJS_ROOT_SCOPE,
  ArtefactFilter,
  AugmentedExecutionsService,
  AugmentedScreenService,
  Execution,
  ExecutionParameters,
  RepositoryObjectReference,
  ScheduledTaskDialogsService,
} from '@exense/step-core';
import { ILocationService, IRootScopeService } from 'angular';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { DOCUMENT } from '@angular/common';
import { IncludeTestcases } from '../../shared/include-testcases.interface';

@Component({
  selector: 'step-execution-commands',
  templateUrl: './execution-commands.component.html',
  styleUrls: ['./execution-commands.component.scss'],
})
export class ExecutionCommandsComponent implements OnInit, OnChanges {
  @Input() description?: string;
  @Input() repositoryObjectRef?: RepositoryObjectReference;
  @Input() isolateExecution?: boolean;
  @Input() includedTestcases?: IncludeTestcases | null;
  @Input() execution?: Execution;
  @Output() onExecute = new EventEmitter<unknown>();

  executionParameters?: Record<string, string>;
  isExecutionIsolated: boolean = false;

  constructor(
    private _executionService: AugmentedExecutionsService,
    private _screenTemplates: AugmentedScreenService,
    private _scheduledTaskDialogs: ScheduledTaskDialogsService,
    @Inject(AJS_ROOT_SCOPE) private _rootScope$: IRootScopeService,
    @Inject(AJS_LOCATION) private _location$: ILocationService,
    @Inject(DOCUMENT) private _document: Document
  ) {}

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
    const executionParams = this.buildExecutionParams(simulate);
    this._executionService.execute(executionParams).subscribe((eId) => {
      (this._location$ as any)['$$search'] = {};
      this._location$.path(`/root/executions/${eId}`);
      this.onExecute.emit({});
    });
  }

  stop(): void {
    this._executionService.abort(this.execution!.id!).subscribe();
  }

  schedule(): void {
    const executionParams = this.buildExecutionParams(false);
    this._scheduledTaskDialogs.newScheduledTask(executionParams).subscribe(() => {
      this._location$.path('/root/scheduler/');
    });
  }

  copyExecutionServiceAsCurlToClipboard(): Promise<void> {
    const { location, navigator } = this._document.defaultView as Window;
    let url = `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ''}`;
    url = `${url}/rest/executions/start`;

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

  private buildExecutionParams(simulate: boolean): ExecutionParameters {
    const userID = (this._rootScope$ as any)['context']['userID'];
    const description = this.description;
    const mode = simulate ? 'SIMULATION' : 'RUN';
    const repositoryObject = this.repositoryObjectRef;
    const isolatedExecution = this.isExecutionIsolated;

    let artefactFilter: ArtefactFilter | undefined;
    if (this.includedTestcases) {
      if (this.includedTestcases.by === 'id') {
        (artefactFilter as any) = {
          class: 'step.artefacts.filters.TestCaseIdFilter',
          includedIds: this.includedTestcases.list,
        };
      } else if (this.includedTestcases.by === 'name') {
        (artefactFilter as any) = {
          class: 'step.artefacts.filters.TestCaseFilter',
          includedNames: this.includedTestcases.list,
        };
      } else if (this.includedTestcases.by === 'all') {
        delete artefactFilter;
      } else {
        throw `Unsupported clause ${this.includedTestcases.by}`;
      }
    }
    return {
      userID,
      description,
      mode,
      repositoryObject,
      exports: [],
      isolatedExecution,
      artefactFilter,
      customParameters: this.executionParameters,
    };
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionCommands', downgradeComponent({ component: ExecutionCommandsComponent }));
