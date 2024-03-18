import { Component, inject } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { RichEditorComponent } from '../rich-editor/rich-editor.component';
import { AceMode } from '../../types/ace-mode.enum';
import { KeyValue } from '@angular/common';

export interface RichEditorDialogData {
  title: string;
  text: string;
  predefinedMode?: AceMode;
  allowedModes?: AceMode[];
}

type DialogRef = MatDialogRef<RichEditorDialogComponent, string>;

const ALL_MODES: Record<AceMode, string> = Object.keys(AceMode).reduce(
  (result, readableKey) => {
    const key = (AceMode as Record<string, AceMode>)[readableKey];
    result[key] = readableKey;
    return result;
  },
  {} as Record<AceMode, string>,
);

@Component({
  selector: 'step-rich-editor-dialog',
  standalone: true,
  imports: [StepBasicsModule, RichEditorComponent],
  templateUrl: './rich-editor-dialog.component.html',
  styleUrl: './rich-editor-dialog.component.scss',
})
export class RichEditorDialogComponent {
  private _fb = inject(FormBuilder).nonNullable;
  private _dialogRef = inject<DialogRef>(MatDialogRef);

  protected _data = inject<RichEditorDialogData>(MAT_DIALOG_DATA);
  protected textControl = this._fb.control(this._data.text);

  protected allowedModes: KeyValue<AceMode, string>[] = Object.entries(ALL_MODES)
    .map(([key, value]) => ({ key, value }) as KeyValue<AceMode, string>)
    .filter((item) => !this._data.allowedModes || this._data.allowedModes.includes(item.key));

  protected selectedMode: AceMode = this.allowedModes[0]?.key ?? AceMode.TEXT;
  protected predefineModeLabel = !!this._data.predefinedMode ? ALL_MODES[this._data.predefinedMode] : undefined;

  cancel(): void {
    this._dialogRef.close(this._data.text);
  }

  save(): void {
    this._dialogRef.close(this.textControl.value);
  }
}
