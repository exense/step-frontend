import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  ArtefactInfo as ArtefactInfoInternal,
  ArtefactService,
  ControllerService,
  CustomFormComponent,
  ExecutionCommandsContext,
  ExecutionLaunchDashletContext,
  IncludeTestcases,
  PlanEditorService,
  RepositoryObjectReference,
  TableColumnsConfig,
  TablePersistenceConfig,
  TestRunStatus,
  ViewRegistryService,
} from '@exense/step-core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SchedulerInvokerService } from '../../services/scheduler-invoker.service';
import { ExecutionCommandsDirective } from '../../directives/execution-commands.directive';
import { ExecutionCommandsService } from '../../services/execution-commands.service';
import { catchError, finalize, map, of } from 'rxjs';
import { RepositoryPlanTestcaseListComponent } from '../repository-plan-testcase-list/repository-plan-testcase-list.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface AltExecutionLaunchDialogData {
  title?: string;
  repoRef: RepositoryObjectReference;
  parameters?: Record<string, string>;
  testCases?: {
    items?: TestRunStatus[];
    selection?: IncludeTestcases;
  };
  hideCancel?: boolean;
  isolateExecution?: boolean;
  allowExecutionTargetSelection?: boolean;
}

interface ArtefactInfo extends ArtefactInfoInternal {
  icon?: string;
}

@Component({
  selector: 'step-alt-execution-launch-dialog',
  templateUrl: './alt-execution-launch-dialog.component.html',
  styleUrl: './alt-execution-launch-dialog.component.scss',
  providers: [
    {
      provide: TableColumnsConfig,
      useValue: null,
    },
    {
      provide: TablePersistenceConfig,
      useValue: null,
    },
    ExecutionCommandsService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AltExecutionLaunchDialogComponent
  extends ExecutionCommandsDirective
  implements AfterViewInit, ExecutionCommandsContext
{
  private _controllersApi = inject(ControllerService);
  private _artefactsService = inject(ArtefactService);
  private _viewRegistry = inject(ViewRegistryService);
  private _data = inject<AltExecutionLaunchDialogData>(MAT_DIALOG_DATA);
  protected _schedulerInvoker = inject(SchedulerInvokerService, { optional: true });

  protected readonly title = this._data.title ?? 'Launch Execution';
  protected readonly repoRef = this._data.repoRef;
  protected readonly explicitTestCases = this._data.testCases?.items;
  protected readonly showCancel = !this._data.hideCancel;
  protected readonly executionIsolation = !!this._data.isolateExecution;
  protected readonly headerDashlets = this._viewRegistry.getDashlets('execution/launch/header');
  protected readonly bodyDashlets = this._viewRegistry.getDashlets('execution/launch/body');

  private readonly testCasesComponent = viewChild('testCases', { read: RepositoryPlanTestcaseListComponent });
  private readonly customForm = viewChild(CustomFormComponent);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | undefined>(undefined);
  protected readonly artefact = signal<ArtefactInfo | undefined>(undefined);
  protected readonly testcases = signal<IncludeTestcases | undefined>(undefined);
  private readonly planName = computed(() => this.artefact()?.name);
  private readonly ready = computed(() => {
    const artefact = this.artefact();
    const loading = this.loading();
    const screenTemplateLoading = this.screenTemplateLoading();
    return !!artefact && !loading && !screenTemplateLoading;
  });
  protected readonly dashletContext: ExecutionLaunchDashletContext = {
    commands: this._commands,
    allowExecutionTargetSelection: !!this._data.allowExecutionTargetSelection,
    planName: this.planName,
    ready: this.ready,
  };

  ngAfterViewInit(): void {
    this.loadArtefact();
  }

  protected override setupExecutionParameters(): void {
    this.executionParameters$
      .pipe(
        map((executionParameters) => executionParameters ?? {}),
        map((executionParameters) => {
          const contextParameters = this._data?.parameters ?? {};
          return {
            ...executionParameters,
            ...contextParameters,
          };
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((executionParameters) => {
        this.executionParameters.set(executionParameters);
      });
  }

  /* eslint-disable step-lint/component-public-fields -- Public overrides implement ExecutionCommandsContext and the base execution actions. */
  override getIncludedTestcases(): IncludeTestcases | null | undefined {
    return this.testcases();
  }

  override getCustomForms(): CustomFormComponent | undefined {
    return this.customForm();
  }

  override getDescription(): string | undefined {
    return this.artefact()?.name;
  }

  override getRepositoryObjectRef(): RepositoryObjectReference | undefined {
    return this.repoRef;
  }

  override getIsExecutionIsolated(): boolean {
    return this.executionIsolation;
  }

  override schedule(): void {
    this._commands.prefillScheduledTask().subscribe((task) => {
      this._schedulerInvoker?.openScheduler(task);
    });
  }
  /* eslint-enable step-lint/component-public-fields */

  private loadArtefact(): void {
    if (!this.repoRef) {
      return;
    }
    this.loading.set(true);
    this._controllersApi
      .getArtefactInfo(this.repoRef)
      .pipe(
        map((artefact) => {
          const icon = this._artefactsService.getArtefactType(artefact.type)?.icon;
          return {
            ...artefact,
            icon,
          } as ArtefactInfo;
        }),
        catchError((error) => {
          this.error.set(error);
          return of(undefined);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((artefact) => {
        if (artefact) {
          this.artefact.set(artefact);
        }
      });
  }

  private effectInitTestCases = effect(() => {
    const testCases = this.testCasesComponent();
    if (!testCases) {
      return;
    }
    const selection = this._data.testCases?.selection;
    if (!selection || selection.by === 'all') {
      return;
    }
    setTimeout(() => {
      testCases.reselect(selection.list);
    }, 500);
  });
}
