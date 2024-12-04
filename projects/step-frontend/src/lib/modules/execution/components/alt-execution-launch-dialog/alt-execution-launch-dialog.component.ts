import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  ArtefactInfo,
  ControllerService,
  IncludeTestcases,
  RepositoryObjectReference,
  TableColumnsConfig,
  TablePersistenceConfig,
} from '@exense/step-core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SchedulerInvokerService } from '../../services/scheduler-invoker.service';
import { ExecutionCommandsDirective } from '../../directives/execution-commands.directive';
import { ExecutionCommandsContext } from '../../shared/execution-commands-context.interface';
import { ExecutionCommandsService } from '../../services/execution-commands.service';

export interface AltExecutionLaunchDialogData {
  title?: string;
  repoRef: RepositoryObjectReference;
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
})
export class AltExecutionLaunchDialogComponent
  extends ExecutionCommandsDirective
  implements OnInit, ExecutionCommandsContext
{
  private _controllersApi = inject(ControllerService);
  private _data = inject<AltExecutionLaunchDialogData>(MAT_DIALOG_DATA);
  protected _schedulerInvoker = inject(SchedulerInvokerService, { optional: true });

  protected readonly title = this._data.title ?? 'Launch Execution';
  protected readonly repoRef = this._data.repoRef;

  protected loading = signal(false);
  protected error = signal<string | undefined>(undefined);
  protected artefact = signal<ArtefactInfo | undefined>(undefined);
  protected testcases = signal<IncludeTestcases | undefined>(undefined);

  ngOnInit(): void {
    this.loadArtefact();
  }

  override getIncludedTestcases(): IncludeTestcases | null | undefined {
    return this.testcases();
  }

  override getDescription(): string | undefined {
    return this.artefact()?.name;
  }

  override getRepositoryObjectRef(): RepositoryObjectReference | undefined {
    return this.repoRef;
  }

  override schedule() {
    this._commands.prefillScheduledTask().subscribe((task) => {
      this._schedulerInvoker?.openScheduler(task);
    });
  }

  private loadArtefact(): void {
    if (!this.repoRef) {
      return;
    }
    this.loading.set(true);
    this._controllersApi.getArtefactInfo(this.repoRef).subscribe({
      next: (artefact) => this.artefact.set(artefact),
      error: (error) => this.error.set(error),
      complete: () => this.loading.set(false),
    });
  }
}
