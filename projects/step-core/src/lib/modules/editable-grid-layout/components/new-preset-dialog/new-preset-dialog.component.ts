import {Component, inject} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DialogsService, StepBasicsModule} from '../../../basics/step-basics.module';

export interface NewPresetDialogData {
  existedPresetNames: string[]
}

@Component({
  selector: 'step-new-preset-dialog',
  imports: [
    StepBasicsModule
  ],
  templateUrl: './new-preset-dialog.component.html',
  styleUrl: './new-preset-dialog.component.scss'
})
export class NewPresetDialogComponent {
  private _dialogRef = inject(MatDialogRef);
  private _dialogData = inject<NewPresetDialogData>(MAT_DIALOG_DATA);
  private _dialogService = inject(DialogsService);
  private _fb = inject(FormBuilder).nonNullable;

  private readonly existedPresets = new Set(this._dialogData.existedPresetNames);

  protected readonly form = this._fb.group({
    name: this._fb.control('', Validators.required)
  });

  protected handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.controls.name.value;
    if (this.existedPresets.has(name)) {
      this._dialogService.showErrorMsg(`"${name}" is already taken. Please set another name`);
      return;
    }

    this._dialogRef.close(name);
  }
}
