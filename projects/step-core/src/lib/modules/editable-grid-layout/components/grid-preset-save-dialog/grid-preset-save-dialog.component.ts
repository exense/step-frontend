import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
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
  name: string;
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

  private readonly overrideName = this._dialogData.currentLayoutName;
  private readonly saveAsNewName = this._dialogData.defaultName;

  // Tracks the last value set automatically so we know whether the user has manually edited the field
  private lastAutoName = this._dialogData.isProtected ? this.saveAsNewName : this.overrideName;

  private readonly nameExistsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const existingNames = this._dialogData.existingPresetNames;
    const value = (control.value as string)?.trim();
    if (!value) return null;
    // In override mode the original name is always a valid choice (simple re-save without rename)
    const saveType = this.saveForm?.controls.saveType.value ?? SaveType.SAVE_AND_OVERRIDE;
    if (saveType === SaveType.SAVE_AND_OVERRIDE && value === this._dialogData.currentLayoutName) return null;
    return existingNames.includes(value) ? { nameExists: true } : null;
  };

  protected readonly saveForm = this._fb.group({
    saveType: this._fb.control<SaveType>(
      this._dialogData.isProtected ? SaveType.SAVE_AS_NEW : SaveType.SAVE_AND_OVERRIDE,
      Validators.required,
    ),
    isShared: this._fb.control<boolean>(this._dialogData.isProtected ? false : this._dialogData.isShared),
    name: this._fb.control<string>(this._dialogData.isProtected ? this.saveAsNewName : this.overrideName, [
      this.nameExistsValidator,
    ]),
  });

  protected readonly saveType = toSignal(this.saveForm.controls.saveType.valueChanges, {
    initialValue: this.saveForm.controls.saveType.value,
  });

  private effectSetupDefaultNameValidity = effect(() => {
    const saveType = this.saveType();
    const isNameRequired = saveType === SaveType.SAVE_AS_NEW;
    toggleValidators(isNameRequired, this.saveForm.controls.name, Validators.required);

    // Auto-update the name field when the mode switches, but only if the user hasn't manually changed it
    const autoName = saveType === SaveType.SAVE_AND_OVERRIDE ? this.overrideName : this.saveAsNewName;
    const currentName = untracked(() => this.saveForm.controls.name.value);
    if (currentName === this.lastAutoName) {
      this.lastAutoName = autoName;
      this.saveForm.controls.name.setValue(autoName, { emitEvent: false });
    }
  });

  protected handleSubmit(): void {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched();
      return;
    }
    const { saveType, name, isShared } = this.saveForm.value;
    const isOverride = saveType === SaveType.SAVE_AND_OVERRIDE;
    this._dialogRef.close({ isOverride, name: name!, isShared: isShared! });
  }

  protected readonly SaveType = SaveType;
}
