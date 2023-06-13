import { Component, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExecutionParameters, ExecutiontTaskParameters } from '../../client/step-client-module';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'step-new-scheduler-task-dialog',
  templateUrl: './new-scheduler-task-dialog.component.html',
  styleUrls: ['./new-scheduler-task-dialog.component.scss'],
})
export class NewSchedulerTaskDialogComponent {
  private _fb = inject(FormBuilder).nonNullable;
  private _matDialogRef = inject<MatDialogRef<NewSchedulerTaskDialogComponent>>(MatDialogRef);
  private _executionParameters = inject<ExecutionParameters>(MAT_DIALOG_DATA);

  readonly newSchedulerTaskForm = this._fb.group({
    name: this._fb.control(this._executionParameters.description, Validators.required),
    cronExpression: this._fb.control('', Validators.required),
  });

  @HostListener('keydown.enter')
  save(): void {
    if (this.newSchedulerTaskForm.invalid) {
      this.newSchedulerTaskForm.markAllAsTouched();
      return;
    }
    const formValue = this.newSchedulerTaskForm.value;
    const executionsParameters = this._executionParameters;
    const attributes: Record<string, string> = {
      name: formValue.name!,
    };
    const taskParameters: ExecutiontTaskParameters = {
      ...formValue,
      executionsParameters,
      attributes,
    };
    this._matDialogRef.close(taskParameters);
  }
}
