import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  viewChild,
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
  CustomFormComponent,
} from '@exense/step-core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { ExecutionTabManagerService } from '../../services/execution-tab-manager.service';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { ExecutionActionsTooltips } from '../execution-actions/execution-actions.component';

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

  private customForms = viewChild(CustomFormComponent);

  @Input() description?: string;
  @Input() repositoryObjectRef?: RepositoryObjectReference;
  @Input() isolateExecution?: boolean;
  @Input() includedTestcases?: IncludeTestcases | null;
  @Input() execution?: Execution;
  @Input() displayParametersForm = true;
  @Input() tooltips?: ExecutionActionsTooltips;

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
    this.buildExecutionParams(simulate)
      .pipe(switchMap((executionParameters) => this._executionService.execute(executionParameters)))
      .subscribe((eId) => {
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
    this.prefillScheduledTask().subscribe((task) => {
      this.scheduleTask.emit(task);
    });
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

  private cloneRepositoryObjectRef(): RepositoryObjectReference | undefined {
    if (!this.repositoryObjectRef) {
      return undefined;
    }
    const { repositoryID, repositoryParameters } = this.repositoryObjectRef;
    return {
      repositoryID,
      repositoryParameters: repositoryParameters ? { ...repositoryParameters } : undefined,
    };
  }

  private buildExecutionParams(simulate: boolean, includeUserId = true): Observable<ExecutionParameters> {
    const customForms = this.customForms();
    const isReady$ = !customForms ? of(undefined) : customForms.readyToProceed();
    return isReady$.pipe(
      map(() =>
        this._executionParamsFactory.create({
          simulate,
          includeUserId,
          description: this.description,
          repositoryObject: this.cloneRepositoryObjectRef(),
          isolatedExecution: this.isExecutionIsolated,
          includedTestCases: this.includedTestcases ?? undefined,
          customParameters: this.executionParameters,
        }),
      ),
    );
  }

  private prefillScheduledTask(): Observable<ExecutiontTaskParameters> {
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
}
