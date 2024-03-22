import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  ArtefactFilter,
  AugmentedExecutionsService,
  AugmentedScreenService,
  AuthService,
  Execution,
  ExecutionParameters,
  ExecutiontTaskParameters,
  RepositoryObjectReference,
  ScheduledTaskDialogsService,
} from '@exense/step-core';
import { DOCUMENT } from '@angular/common';
import { IncludeTestcases } from '../../shared/include-testcases.interface';
import { Router } from '@angular/router';
import { ExecutionTabManagerService } from '../../services/execution-tab-manager.service';

@Component({
  selector: 'step-execution-commands',
  templateUrl: './execution-commands.component.html',
  styleUrls: ['./execution-commands.component.scss'],
})
export class ExecutionCommandsComponent implements OnInit, OnChanges {
  private _executionTabManager = inject(ExecutionTabManagerService, { optional: true });
  private _router = inject(Router);
  private _executionService = inject(AugmentedExecutionsService);
  private _screenTemplates = inject(AugmentedScreenService);
  private _scheduledTaskDialogs = inject(ScheduledTaskDialogsService);
  private _authService = inject(AuthService);
  private _document = inject(DOCUMENT);

  @Input() description?: string;
  @Input() repositoryObjectRef?: RepositoryObjectReference;
  @Input() isolateExecution?: boolean;
  @Input() includedTestcases?: IncludeTestcases | null;
  @Input() execution?: Execution;

  @Output() refresh = new EventEmitter<void>();

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
      this._router.navigateByUrl(`/executions/open/${eId}`);
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
    this._scheduledTaskDialogs.editScheduledTask(task).subscribe((result) => {
      if (result) {
        this._router.navigate(['scheduler']);
      }
    });
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
    const userID = includeUserId ? this._authService.getUserID() : undefined;
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
        (artefactFilter as any) = undefined;
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

  private prefillScheduledTask(): ExecutiontTaskParameters {
    const executionsParameters = this.buildExecutionParams(false, false);
    const name = executionsParameters.description ?? '';
    return {
      attributes: { name },
      executionsParameters,
    };
  }
}
