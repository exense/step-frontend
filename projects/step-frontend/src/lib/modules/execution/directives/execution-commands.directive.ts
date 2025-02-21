import { computed, Directive, inject, input, output } from '@angular/core';
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
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { ExecutionCommandsService } from '../services/execution-commands.service';

@Directive({
  selector: '[stepExecutionCommands]',
  exportAs: 'StepExecutionCommands',
  providers: [ExecutionCommandsService],
})
export class ExecutionCommandsDirective implements ExecutionCommandsContext {
  private _screenTemplates = inject(AugmentedScreenService);
  protected _commands = inject(ExecutionCommandsService).useContext(this);

  /** @Input **/
  readonly description = input<string | undefined>(undefined);

  /** @Input **/
  readonly repositoryObjectRef = input<RepositoryObjectReference | undefined>(undefined);

  /** @Input **/
  readonly isolateExecution = input<boolean | undefined>(undefined);

  /** @Input **/
  readonly includedTestcases = input<IncludeTestcases | null | undefined>(undefined);

  /** @Input **/
  readonly execution = input<Execution | undefined>(undefined);

  /** @Input **/
  readonly displayParametersForm = input(true);

  /** @Input **/
  readonly tooltips = input<ExecutionActionsTooltips | undefined>(undefined);

  /** @Output **/
  readonly commandInvoke = output<void>();

  /** @Output **/
  readonly refresh = output<void>();

  /** @Output **/
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

  private executionParameters$ = toObservable(this.execution).pipe(
    switchMap((execution) => {
      if (!execution) {
        return this._screenTemplates.getDefaultParametersByScreenId('executionParameters');
      }
      const parameters = execution.executionParameters?.customParameters || {};
      return of({ ...parameters });
    }),
  );

  protected executionParameters = toSignal(this.executionParameters$);

  protected isExecutionIsolated = computed(() => {
    const isolateExecution = this.isolateExecution();
    const execution = this.execution();
    return isolateExecution ? true : execution?.executionParameters?.isolatedExecution || false;
  });

  execute(simulate: boolean): void {
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
}
