import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AutomationPackageUpdateResult,
  AugmentedPlansService,
  IDE_MODE,
  IdeStateStrategyService,
  Plan,
  RemoteExecution,
  StepCoreModule,
} from '@exense/step-core';
import { EMPTY, expand, finalize, map, reduce } from 'rxjs';
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
export class IdeRemoteOperationDialogComponent implements OnInit {
  private readonly _data = inject<IdeRemoteOperationDialogData>(MAT_DIALOG_DATA);
  private readonly _ideMode = inject(IDE_MODE);
  private readonly _ideState = inject(IdeStateStrategyService);
  private readonly _defaults = inject(IdeRemoteDefaultsService);
  private readonly _api = inject(IdeRemoteApiService);
  private readonly _plansApi = inject(AugmentedPlansService);
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
  protected readonly plans = signal<Plan[] | undefined>(undefined);
  protected readonly plansError = signal<string | undefined>(undefined);
  protected readonly plansLoading = computed(() => this.operation === 'EXECUTE' && !this.plans() && !this.plansError());
  protected readonly planNames = computed(() => {
    const plans = this.plans();
    const request = this.executionRequest();
    if (!plans) {
      return undefined;
    }
    return plans
      .filter((plan) => {
        const name = plan.attributes?.['name'];
        const categories = plan.categories ?? [];
        return (
          (!request?.includePlans || request.includePlans.includes(name ?? '')) &&
          (!request?.excludePlans || !request.excludePlans.includes(name ?? '')) &&
          (!request?.includeCategories ||
            request.includeCategories.some((category) => categories.includes(category))) &&
          (!request?.excludeCategories || !request.excludeCategories.some((category) => categories.includes(category)))
        );
      })
      .map((plan, index) => plan.attributes?.['name'] || `Plan ${index + 1}`);
  });
  protected readonly submissionError = signal<string | undefined>(undefined);
  protected readonly completed = computed(() => this.deploymentSucceeded() || this.executionResults() !== undefined);
  protected readonly executionRequest = computed(() => this._defaults.getExecutionRequest());
  protected readonly readinessError = computed(() => {
    const currentPackage = this._ideState.currentPackage();
    const inProgress = this._ideState.inProgress();
    const defaultsError = this._defaults.getOperationError(this.operation === 'DEPLOY' ? 'deploy' : 'execute');
    const plans = this.planNames();
    const plansError = this.plansError();
    if (!this._ideMode) {
      return 'Remote operations are available only in Step Studio.';
    }
    if (inProgress) {
      return 'Wait for the automation package operation to finish.';
    }
    if (!currentPackage) {
      return 'Open an automation package before using remote operations.';
    }
    if (defaultsError) {
      return defaultsError;
    }
    if (this.operation === 'EXECUTE') {
      if (plansError) {
        return plansError;
      }
      if (plans && !plans.length) {
        return 'No plans match the current CLI execution settings.';
      }
    }
    return undefined;
  });

  ngOnInit(): void {
    if (this.operation === 'EXECUTE') {
      this.loadPlans();
    }
  }

  private loadPlans(): void {
    const pageSize = 200;
    this._plansApi
      .getAllPlans(0, pageSize)
      .pipe(
        map((plans) => ({ plans, skip: 0 })),
        expand(({ plans, skip }) =>
          plans.length === pageSize
            ? this._plansApi
                .getAllPlans(skip + pageSize, pageSize)
                .pipe(map((next) => ({ plans: next, skip: skip + pageSize })))
            : EMPTY,
        ),
        reduce((all, page) => [...all, ...page.plans], [] as Plan[]),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe({
        next: (plans) => this.plans.set(plans),
        error: () => this.plansError.set('Could not load the plans in this Automation Package.'),
      });
  }

  protected submit(): void {
    if (this.busy() || this.completed() || this.readinessError() || this.plansLoading()) {
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
