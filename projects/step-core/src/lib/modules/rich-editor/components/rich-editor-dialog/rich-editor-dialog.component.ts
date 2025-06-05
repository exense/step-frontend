import { Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { DialogsService, StepBasicsModule } from '../../../basics/step-basics.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { RichEditorComponent } from '../rich-editor/rich-editor.component';
import { AceMode } from '../../types/ace-mode.enum';
import { RichEditorSettingsBarComponent } from '../rich-editor-settings-bar/rich-editor-settings-bar.component';
import { RichEditorChangeStatus } from '../../types/rich-editor-change-status.enum';
import { debounceTime, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RichEditorChangeStatusComponent } from '../rich-editor-change-status/rich-editor-change-status.component';

export interface RichEditorDialogData {
  title?: string;
  text: string;
  predefinedMode?: AceMode;
  allowedModes?: AceMode[];
  isReadOnly?: boolean;
  wrapText?: boolean;
}

type DialogRef = MatDialogRef<RichEditorDialogComponent, string>;

@Component({
  selector: 'step-rich-editor-dialog',
  imports: [StepBasicsModule, RichEditorComponent, RichEditorSettingsBarComponent, RichEditorChangeStatusComponent],
  templateUrl: './rich-editor-dialog.component.html',
  styleUrl: './rich-editor-dialog.component.scss',
})
export class RichEditorDialogComponent implements OnInit {
  private _fb = inject(FormBuilder).nonNullable;
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _destroyRef = inject(DestroyRef);
  private _dialogs = inject(DialogsService);

  private richEditor = viewChild(RichEditorComponent);

  protected _data = inject<RichEditorDialogData>(MAT_DIALOG_DATA);
  protected textControl = this._fb.control(this._data.text);

  protected selectedMode = AceMode.TEXT;

  protected changeStatus = RichEditorChangeStatus.NO_CHANGES;

  ngOnInit(): void {
    if (this._data.isReadOnly) {
      this.textControl.disable();
      return;
    }
    this.textControl.valueChanges
      .pipe(
        debounceTime(300),
        map((value) => value !== this._data.text),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((hasChanges) => {
        this.changeStatus = hasChanges ? RichEditorChangeStatus.PENDING_CHANGES : RichEditorChangeStatus.NO_CHANGES;
      });
  }

  focusEditor(): void {
    this.richEditor()?.focusOnText();
  }

  cancel(): void {
    if (this.changeStatus === RichEditorChangeStatus.PENDING_CHANGES) {
      this._dialogs.showWarning('You have unsaved changed. Do you want to close the dialog?').subscribe((confirmed) => {
        if (confirmed) {
          this._dialogRef.close(undefined);
        }
      });
      return;
    }
    this._dialogRef.close(undefined);
  }

  save(): void {
    this._dialogRef.close(this.textControl.value);
  }
}
