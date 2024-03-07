import { Component, HostBinding, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ColumnEditorDialogData } from '../../types/column-editor-dialog-data';
import { FormBuilder } from '@angular/forms';
import { Input as SInput, ScreenInput } from '../../../../client/step-client-module';
import {
  CUSTOM_UI_COMPONENTS_FORMATTER,
  DialogsService,
  EXPRESSION_SCRIPT_FORMATTER,
} from '../../../basics/step-basics.module';
import { inputFormCreate } from '../../types/column-editor-dialog.form';

type InputType = SInput['type'];

export enum CustomColumnEditorDialogOperation {
  SAVE,
  DELETE,
}

export interface CustomColumnEditorDialogResult {
  operation: CustomColumnEditorDialogOperation;
  screenInput: ScreenInput;
}

type DialogRef = MatDialogRef<CustomColumnEditorDialogComponent, CustomColumnEditorDialogResult | undefined>;

@Component({
  selector: 'step-custom-column-editor-dialog',
  templateUrl: './custom-column-editor-dialog.component.html',
  styleUrl: './custom-column-editor-dialog.component.scss',
})
export class CustomColumnEditorDialogComponent {
  private _fb = inject(FormBuilder).nonNullable;
  private _screenInput = inject<ColumnEditorDialogData>(MAT_DIALOG_DATA).screenInput;
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _dialogs = inject(DialogsService);

  readonly isNew = !this._screenInput.id;
  readonly modalTitle = `${this.isNew ? 'New' : 'Edit'} Column`;
  readonly ALLOWED_TYPES: InputType[] = ['DROPDOWN', 'TEXT', 'CHECKBOX'];

  protected showAdvanced = false;

  readonly customUIComponentsFormatter = CUSTOM_UI_COMPONENTS_FORMATTER;
  readonly activationExpressionFormatter = EXPRESSION_SCRIPT_FORMATTER;

  readonly form = inputFormCreate(this._fb, this._screenInput.input);

  @HostBinding('keydown.enter')
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const screenInput = { ...(this._screenInput ?? {}) };
    screenInput.input = this.form.value;
    this._dialogRef.close({ operation: CustomColumnEditorDialogOperation.SAVE, screenInput });
  }

  remove(): void {
    let label = this.form.controls.label.value;
    label = !!label ? `"${label}"` : 'this';
    this._dialogs.showWarning(`Do you want to delete ${label} column?`).subscribe((isConfirmed) => {
      if (!isConfirmed) {
        return;
      }
      const screenInput = this._screenInput;
      this._dialogRef.close({ operation: CustomColumnEditorDialogOperation.DELETE, screenInput });
    });
  }
}
