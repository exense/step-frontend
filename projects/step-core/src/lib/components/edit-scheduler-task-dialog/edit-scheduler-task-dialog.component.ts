import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm, NgModel } from '@angular/forms';
import {
  AugmentedSchedulerService,
  ExecutionParameters,
  ExecutiontTaskParameters,
  Plan,
} from '../../client/step-client-module';
import { CronService } from '../../modules/cron/cron.module';

type EditDialogRef = MatDialogRef<EditSchedulerTaskDialogComponent, ExecutiontTaskParameters>;

@Component({
  selector: 'step-scheduled-task-edit-dialog',
  templateUrl: './edit-scheduler-task-dialog.component.html',
  styleUrls: ['./edit-scheduler-task-dialog.component.scss'],
})
export class EditSchedulerTaskDialogComponent implements OnInit {
  readonly rawValueModelOptions: NgModel['options'] = { updateOn: 'blur' };

  private _cron = inject(CronService);
  private _api = inject(AugmentedSchedulerService);
  private _matDialogRef = inject<EditDialogRef>(MatDialogRef);
  protected _task = inject<ExecutiontTaskParameters>(MAT_DIALOG_DATA);

  protected plan?: Partial<Plan>;

  protected isNew = true;
  protected error = '';
  protected showParameters = false;
  protected parametersRawValue: string = '';

  @ViewChild('formContainer', { static: false })
  private form!: NgForm;

  ngOnInit(): void {
    this.initializeTask();
  }

  @HostListener('keydown.enter')
  save(): void {
    if (this.form.control.invalid) {
      this.form.control.markAllAsTouched();
      return;
    }
    this._api.saveExecutionTask(this._task).subscribe({
      next: (task) => this._matDialogRef.close(task),
      error: () => {
        this.error = 'Invalid CRON expression or server error.';
      },
    });
  }

  handlePlanChange(plan: Plan): void {
    this.plan = plan;
    if (!this._task.executionsParameters!.repositoryObject) {
      this._task.executionsParameters!.repositoryObject = {};
    }
    const repositoryObject = this._task.executionsParameters!.repositoryObject!;
    if (!repositoryObject.repositoryParameters) {
      repositoryObject.repositoryParameters = {};
    }
    if (plan?.id) {
      repositoryObject.repositoryParameters!['planid'] = plan.id!;
      this._task.executionsParameters!.description = plan?.attributes?.['name'] ?? undefined;
      if (!this._task.attributes) {
        this._task.attributes = {};
      }
    }
    this.updateParametersRawValue();
  }

  handleDescriptionChange(description: string): void {
    this._task.attributes!['description'] = description;
    this.updateParametersRawValue();
  }

  handleUserIdChange(userId: string): void {
    this._task.executionsParameters!.userID = userId;
    this.updateParametersRawValue();
  }

  handleCustomParametersChange(customParams: Record<string, unknown>): void {
    this._task.executionsParameters!.customParameters = customParams as Record<string, string>;
    this.updateParametersRawValue();
  }

  handleParametersRawValueChange(rawValue: string): void {
    let executionParameters: ExecutionParameters | undefined = undefined;
    try {
      executionParameters = JSON.parse(rawValue);
    } catch (e) {}
    if (executionParameters) {
      this._task.executionsParameters = executionParameters;
    }
  }

  configureCronExpression(): void {
    this._cron.configureExpression().subscribe((expression) => {
      if (expression) {
        this._task.cronExpression = expression;
      }
    });
  }

  addCronExclusion() {
    if (!this._task.cronExclusions) {
      this._task.cronExclusions = [];
    }
    this._task.cronExclusions.push({ description: undefined, cronExpression: undefined });
  }

  removeExclusion(index: number) {
    this._task.cronExclusions!.splice(index, 1);
  }

  private initializeTask(): void {
    if (!this._task.attributes) {
      this._task.attributes = {};
    }
    this.isNew = !this._task.attributes!['name'];
    if (!this._task.executionsParameters) {
      this._task.executionsParameters = {};
    }
    if (!this._task.executionsParameters.customParameters) {
      this._task.executionsParameters.customParameters = {};
    }

    const planId = this._task.executionsParameters?.repositoryObject?.repositoryParameters?.['planid'];
    if (planId) {
      const id = planId;
      const name = this._task.executionsParameters.description ?? '';
      this.plan = {
        id,
        attributes: { name },
      };
    }
    this.updateParametersRawValue();
  }

  private updateParametersRawValue(): void {
    this.parametersRawValue = this._task.executionsParameters ? JSON.stringify(this._task.executionsParameters) : '';
  }
}
