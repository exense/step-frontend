import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { StepBasicsModule, toggleValidators } from '../../../basics/step-basics.module';

export interface GridPresetSaveDialogData {
  readonly isProtected: boolean;
  readonly defaultName: string;
}

export interface GridPresetSaveDialogResult {
  isOverride: boolean;
  name?: string;
}

enum SaveType {
  SAVE_AND_OVERRIDE = 'SAVE_AND_OVERRIDE',
  SAVE_AS_NEW = 'SAVE_AS_NEW',
}

@Component({
  selector: 'step-grid-preset-save-dialog',
  imports: [StepBasicsModule],
  templateUrl: './grid-preset-save-dialog.component.html',
  styleUrl: './grid-preset-save-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridPresetSaveDialogComponent {
  private _dialogRef = inject(MatDialogRef);
  private _fb = inject(FormBuilder).nonNullable;
  protected readonly _dialogData = inject<GridPresetSaveDialogData>(MAT_DIALOG_DATA);

  protected readonly dialogTitle = this._dialogData.isProtected
    ? 'The layout you edited is protected. Do you want to save it as new?'
    : 'Override the existing layout or save it as new.';

  protected readonly saveForm = this._fb.group({
    saveType: this._fb.control<SaveType>(
      this._dialogData.isProtected ? SaveType.SAVE_AS_NEW : SaveType.SAVE_AND_OVERRIDE,
      Validators.required,
    ),
    name: this._fb.control<string>(this._dialogData.defaultName),
  });

  protected readonly saveType = toSignal(this.saveForm.controls.saveType.valueChanges, {
    initialValue: this.saveForm.controls.saveType.value,
  });

  private effectSetupDefaultNameValidity = effect(() => {
    const saveType = this.saveType();
    const isNameRequired = saveType === SaveType.SAVE_AS_NEW;
    toggleValidators(isNameRequired, this.saveForm.controls.name, Validators.required);
  });

  protected handleSubmit(): void {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched();
      return;
    }
    const { saveType, name } = this.saveForm.value;
    const isOverride = saveType === SaveType.SAVE_AND_OVERRIDE;
    const result: GridPresetSaveDialogResult = isOverride ? { isOverride } : { isOverride, name };
    this._dialogRef.close(result);
  }

  protected readonly SaveType = SaveType;
}
