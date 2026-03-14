import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { StepBasicsModule, toggleValidators } from '../../../basics/step-basics.module';

export interface GridPresetSaveDialogData {
  readonly isProtected: boolean;
  readonly defaultName: string;
  readonly currentLayoutName: string;
  readonly isShared: boolean;
  readonly existingPresetNames: string[];
}

export interface GridPresetSaveDialogResult {
  isOverride: boolean;
  name?: string;
  isShared: boolean;
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

  private readonly nameExistsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const existingNames = this._dialogData.existingPresetNames;
    const value = (control.value as string)?.trim();
    if (value && existingNames.includes(value)) {
      return { nameExists: true };
    }
    return null;
  };

  protected readonly saveForm = this._fb.group({
    saveType: this._fb.control<SaveType>(
      this._dialogData.isProtected ? SaveType.SAVE_AS_NEW : SaveType.SAVE_AND_OVERRIDE,
      Validators.required,
    ),
    isShared: this._fb.control<boolean>(this._dialogData.isProtected ? false : this._dialogData.isShared),
    name: this._fb.control<string>(this._dialogData.defaultName),
  });

  protected readonly saveType = toSignal(this.saveForm.controls.saveType.valueChanges, {
    initialValue: this.saveForm.controls.saveType.value,
  });

  private effectSetupDefaultNameValidity = effect(() => {
    const saveType = this.saveType();
    const isNameRequired = saveType === SaveType.SAVE_AS_NEW;
    toggleValidators(isNameRequired, this.saveForm.controls.name, Validators.required, this.nameExistsValidator);
  });

  protected handleSubmit(): void {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched();
      return;
    }
    const { saveType, name, isShared } = this.saveForm.value;
    const isOverride = saveType === SaveType.SAVE_AND_OVERRIDE;
    const result: GridPresetSaveDialogResult = isOverride
      ? { isOverride, isShared: isShared! }
      : { isOverride, name, isShared: isShared! };
    this._dialogRef.close(result);
  }

  protected readonly SaveType = SaveType;
}
