import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AutomationPackageUpdateResult,
  IDE_MODE,
  IdeStateStrategyService,
  RemoteExecution,
  StepCoreModule,
} from '@exense/step-core';
import { finalize } from 'rxjs';
import { IdeRemoteApiService } from '../../services/ide-remote-api.service';
import { IdeRemoteDefaultsService } from '../../services/ide-remote-defaults.service';
import { IdeRemoteResultsComponent } from '../ide-remote-results/ide-remote-results.component';
import { IdeRemoteExecutionOptionsComponent } from '../ide-remote-execution-options/ide-remote-execution-options.component';
import { IdeRemoteTargetComponent } from '../ide-remote-target/ide-remote-target.component';

export type IdeRemoteOperationType = 'DEPLOY' | 'EXECUTE';

export interface IdeRemoteOperationDialogData {
  operation: IdeRemoteOperationType;
}

@Component({
  selector: 'step-ide-remote-operation-dialog',
  imports: [StepCoreModule, IdeRemoteTargetComponent, IdeRemoteResultsComponent, IdeRemoteExecutionOptionsComponent],
  templateUrl: './ide-remote-operation-dialog.component.html',
  styleUrl: './ide-remote-operation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeRemoteOperationDialogComponent {
  private readonly _data = inject<IdeRemoteOperationDialogData>(MAT_DIALOG_DATA);
  private readonly _ideMode = inject(IDE_MODE);
  private readonly _ideState = inject(IdeStateStrategyService);
  private readonly _defaults = inject(IdeRemoteDefaultsService);
  private readonly _api = inject(IdeRemoteApiService);
  private readonly _destroyRef = inject(DestroyRef);

  protected readonly operation = this._data.operation;
  protected readonly target = computed(() =>
    this.operation === 'DEPLOY' ? this._defaults.deployTarget() : this._defaults.executeTarget(),
  );
  protected readonly busy = signal(false);
  protected readonly deploymentResult = signal<AutomationPackageUpdateResult | undefined>(undefined);
  protected readonly deploymentSucceeded = signal(false);
  protected readonly deploymentWarnings = computed(
    () => this.deploymentResult()?.warnings?.map((text, id) => ({ id, text })) ?? [],
  );
  protected readonly executionResults = signal<RemoteExecution[] | undefined>(undefined);
  protected readonly submissionError = signal<string | undefined>(undefined);
  protected readonly completed = computed(() => this.deploymentSucceeded() || this.executionResults() !== undefined);
  protected readonly executionRequest = computed(() => this._defaults.getExecutionRequest());
  protected readonly readinessError = computed(() => {
    const currentPackage = this._ideState.currentPackage();
    const inProgress = this._ideState.inProgress();
    const defaultsError = this._defaults.getOperationError(this.operation === 'DEPLOY' ? 'deploy' : 'execute');
    if (!this._ideMode) {
      return 'Remote operations are available only in IDE mode.';
    }
    if (inProgress) {
      return 'Wait for the automation package operation to finish.';
    }
    if (!currentPackage) {
      return 'Open an automation package before using remote operations.';
    }
    return defaultsError;
  });

  protected submit(): void {
    if (this.busy() || this.completed() || this.readinessError()) {
      return;
    }

    this.busy.set(true);
    this.deploymentResult.set(undefined);
    this.deploymentSucceeded.set(false);
    this.executionResults.set(undefined);
    this.submissionError.set(undefined);

    if (this.operation === 'DEPLOY') {
      const request = this._defaults.getDeploymentRequest();
      if (!request || this.readinessError()) {
        this.busy.set(false);
        return;
      }
      this._api
        .deployRemote(request)
        .pipe(
          finalize(() => this.busy.set(false)),
          takeUntilDestroyed(this._destroyRef),
        )
        .subscribe({
          next: (result) => {
            this.deploymentResult.set(result);
            this.deploymentSucceeded.set(true);
          },
          error: () => this.submissionError.set('Deployment failed. Check the error details and try again.'),
        });
      return;
    }

    const request = this._defaults.getExecutionRequest();
    if (!request || this.readinessError()) {
      this.busy.set(false);
      return;
    }
    this._api
      .executeRemote(request)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe({
        next: (results) => this.executionResults.set(results ?? []),
        error: () => this.submissionError.set('Remote execution failed. Check the error details and try again.'),
      });
  }
}
