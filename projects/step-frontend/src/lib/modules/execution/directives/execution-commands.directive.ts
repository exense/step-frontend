import { computed, DestroyRef, Directive, inject, input, model, OnInit, output, signal } from '@angular/core';
import { ExecutionCommandsContext } from '../shared/execution-commands-context.interface';
import {
  AugmentedScreenService,
  CustomFormComponent,
  Execution,
  ExecutiontTaskParameters,
  IncludeTestcases,
  RepositoryObjectReference,
} from '@exense/step-core';
import { ExecutionActionsTooltips } from '../components/execution-actions/execution-actions.component';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { ExecutionCommandsService } from '../services/execution-commands.service';

@Directive({
  selector: '[stepExecutionCommands]',
  exportAs: 'StepExecutionCommands',
  providers: [ExecutionCommandsService],
  standalone: false,
})
export class ExecutionCommandsDirective implements OnInit, ExecutionCommandsContext {
  private _screenTemplates = inject(AugmentedScreenService);
  protected _commands = inject(ExecutionCommandsService).useContext(this);
  protected _destroyRef = inject(DestroyRef);

  readonly description = input<string | undefined>(undefined);
  readonly repositoryObjectRef = input<RepositoryObjectReference | undefined>(undefined);
  readonly isolateExecution = input<boolean | undefined>(undefined);
  readonly includedTestcases = input<IncludeTestcases | null | undefined>(undefined);
  readonly execution = input<Execution | undefined>(undefined);
  readonly displayParametersForm = input(true);
  readonly tooltips = input<ExecutionActionsTooltips | undefined>(undefined);

  readonly commandInvoke = output<void>();
  readonly refresh = output<void>();
  readonly scheduleTask = output<ExecutiontTaskParameters>();

  getCustomForms(): CustomFormComponent | undefined {
    return undefined;
  }
  getDescription(): string | undefined {
    return this.description();
  }
  getRepositoryObjectRef(): RepositoryObjectReference | undefined {
    return this.repositoryObjectRef();
  }
  getIncludedTestcases(): IncludeTestcases | null | undefined {
    return this.includedTestcases();
  }
  getExecution(): Execution | undefined {
    return this.execution();
  }
  getExecutionParameters(): Record<string, string> | undefined {
    return this.executionParameters();
  }
  getIsExecutionIsolated(): boolean {
    return this.isExecutionIsolated();
  }

  protected readonly executionParameters = model<Record<string, any>>({});
  private readonly defaultParametersLoading = signal(true);
  private readonly customFormLoading = signal(false);
  protected readonly screenTemplateLoading = computed(
    () => this.defaultParametersLoading() || this.customFormLoading(),
  );

  protected readonly executionParameters$ = toObservable(this.execution).pipe(
    switchMap((execution) => {
      this.defaultParametersLoading.set(true);
      const parameters$ = !execution
        ? this._screenTemplates.getDefaultParametersByScreenId('executionParameters')
        : of({ ...execution.executionParameters?.customParameters });
      return parameters$.pipe(
        catchError(() => of({})),
        finalize(() => this.defaultParametersLoading.set(false)),
      );
    }),
  );

  protected readonly isExecutionIsolated = computed(() => {
    const isolateExecution = this.isolateExecution();
    const execution = this.execution();
    return isolateExecution ? true : execution?.executionParameters?.isolatedExecution || false;
  });

  ngOnInit(): void {
    this.setupExecutionParameters();
  }

  execute(simulate: boolean): void {
    if (this.screenTemplateLoading()) {
      return;
    }

    this._commands.execute(simulate);
    this.commandInvoke.emit();
  }

  stop(): void {
    this._commands.stop().subscribe(() => {
      this.refresh.emit();
      this.commandInvoke.emit();
    });
  }

  forceStop(): void {
    this._commands.forceStop().subscribe(() => {
      this.refresh.emit();
      this.commandInvoke.emit();
    });
  }

  schedule(): void {
    this._commands.prefillScheduledTask().subscribe((task) => {
      this.scheduleTask.emit(task);
      this.commandInvoke.emit();
    });
  }

  copyExecutionServiceAsCurlToClipboard(): void {
    this._commands.copyExecutionServiceAsCurlToClipboard();
    this.commandInvoke.emit();
  }

  protected setupExecutionParameters(): void {
    this.executionParameters$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((executionParameters) => {
      this.executionParameters.set(executionParameters ?? {});
    });
  }

  protected setScreenTemplateLoading(isLoading: boolean): void {
    this.customFormLoading.set(isLoading);
  }
}
