import { Component, HostListener, inject, OnInit, viewChild, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm, NgModel } from '@angular/forms';
import {
  AugmentedSchedulerService,
  CronExclusion,
  ExecutionParameters,
  ExecutiontTaskParameters,
  Plan,
} from '../../../../client/step-client-module';
import { CronEditorTab, CronService } from '../../../cron/cron.module';
import { SCHEDULER_COMMON_IMPORTS } from '../../types/scheduler-common-imports.constant';
import { CustomFormComponent } from '../../../custom-forms';
import { DialogRouteResult } from '../../../basics/step-basics.module';
import { SelectPlanComponent } from '../../../plan-common';
import { switchMap } from 'rxjs';

type EditDialogRef = MatDialogRef<EditSchedulerTaskDialogComponent, DialogRouteResult>;

export interface EditSchedulerTaskDialogConfig {
  disablePlan?: boolean;
  disableUser?: boolean;
  hideUser?: boolean;
}

export interface EditSchedulerTaskDialogData {
  taskAndConfig: {
    task: ExecutiontTaskParameters;
    config?: EditSchedulerTaskDialogConfig;
  };
}

@Component({
  selector: 'step-scheduled-task-edit-dialog',
  templateUrl: './edit-scheduler-task-dialog.component.html',
  styleUrls: ['./edit-scheduler-task-dialog.component.scss'],
  standalone: true,
  imports: [SCHEDULER_COMMON_IMPORTS, CustomFormComponent, SelectPlanComponent],
})
export class EditSchedulerTaskDialogComponent implements OnInit {
  readonly rawValueModelOptions: NgModel['options'] = { updateOn: 'blur' };

  readonly EXCLUSION_HELP_MESSAGE =
    'Optionally provide CRON expression(s) for excluding time ranges. (Example: for a schedule set to run every 5 minutes, you can exclude the execution on weekends with “* * * ? * SAT-SUN” )';

  private _cron = inject(CronService);
  private _api = inject(AugmentedSchedulerService);
  private _matDialogRef = inject<EditDialogRef>(MatDialogRef);
  private _dialogData = inject<EditSchedulerTaskDialogData>(MAT_DIALOG_DATA);

  private customForms = viewChild(CustomFormComponent);

  protected task = this._dialogData.taskAndConfig.task;
  protected config = this._dialogData.taskAndConfig.config;

  protected plan?: Partial<Plan>;

  protected isNew = true;
  protected error = '';
  protected showParameters = false;
  protected parametersRawValue: string = '';
  protected repositoryId?: string;
  protected repositoryPlanId?: string;

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
    this.customForms()!
      .readyToProceed()
      .pipe(switchMap(() => this._api.saveExecutionTask(this.task)))
      .subscribe({
        next: (task) => this._matDialogRef.close({ isSuccess: !!task }),
        error: () => {
          this.error = 'Invalid CRON expression or server error.';
        },
      });
  }

  handlePlanChange(plan: Plan): void {
    this.plan = plan;
    if (!this.task.executionsParameters!.repositoryObject) {
      this.task.executionsParameters!.repositoryObject = {};
    }
    const repositoryObject = this.task.executionsParameters!.repositoryObject!;
    if (!repositoryObject.repositoryParameters) {
      repositoryObject.repositoryParameters = {};
    }
    if (plan?.id) {
      repositoryObject.repositoryParameters!['planid'] = plan.id!;
      this.task.executionsParameters!.description = plan?.attributes?.['name'] ?? undefined;
      if (!this.task.attributes) {
        this.task.attributes = {};
      }
    }
    this.updateParametersRawValue();
  }

  handleDescriptionChange(description: string): void {
    this.task.attributes!['description'] = description;
    this.updateParametersRawValue();
  }

  handleUserIdChange(userId: string): void {
    this.task.executionsParameters!.userID = userId;
    this.updateParametersRawValue();
  }

  handleCustomParametersChange(customParams: Record<string, unknown>): void {
    this.task.executionsParameters!.customParameters = customParams as Record<string, string>;
    this.updateParametersRawValue();
  }

  handleParametersRawValueChange(rawValue: string): void {
    let executionParameters: ExecutionParameters | undefined = undefined;
    try {
      executionParameters = JSON.parse(rawValue);
    } catch (e) {}
    if (executionParameters) {
      this.task.executionsParameters = executionParameters;
    }
  }

  configureCronExpression(): void {
    this._cron.configureExpression().subscribe((expression) => {
      if (expression) {
        this.task.cronExpression = expression;
      }
    });
  }

  addCronExclusion() {
    if (!this.task.cronExclusions) {
      this.task.cronExclusions = [];
    }
    this.task.cronExclusions.push({ description: undefined, cronExpression: undefined });
  }

  removeExclusion(index: number) {
    this.task.cronExclusions!.splice(index, 1);
  }

  configureCronExpressionForExclusion(exclusion: CronExclusion): void {
    this._cron
      .configureExpression(CronEditorTab.TIME_RANGE, CronEditorTab.WEEKLY_TIME_RANGE, CronEditorTab.ANY_DAY_TIME_RANGE)
      .subscribe((expression) => {
        if (expression) {
          exclusion.cronExpression = expression;
        }
      });
  }

  private initializeTask(): void {
    if (!this.task.attributes) {
      this.task.attributes = {};
    }
    this.isNew = !this.task.attributes!['name'];
    if (!this.task.executionsParameters) {
      this.task.executionsParameters = {};
    }
    if (!this.task.executionsParameters.customParameters) {
      this.task.executionsParameters.customParameters = {};
    }

    const repository = this.task?.executionsParameters?.repositoryObject;
    if (repository?.repositoryID === 'local') {
      const planId = repository?.repositoryParameters?.['planid'];
      if (planId) {
        const id = planId;
        const name = this.task.executionsParameters.description ?? '';
        this.plan = {
          id,
          attributes: { name },
        };
      }
    } else {
      this.repositoryId = repository?.repositoryID;
      this.repositoryPlanId =
        repository?.repositoryParameters?.['planid'] ?? repository?.repositoryParameters?.['planId'];
    }
    this.updateParametersRawValue();
  }

  private updateParametersRawValue(): void {
    this.parametersRawValue = this.task.executionsParameters ? JSON.stringify(this.task.executionsParameters) : '';
  }
}
