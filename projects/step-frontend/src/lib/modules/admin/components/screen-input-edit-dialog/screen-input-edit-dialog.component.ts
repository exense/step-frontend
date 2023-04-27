import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { AugmentedScreenService, Input as SInput, ModelFormatter, ScreenInput } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ScreenInputEditDialogData } from '../../shared/screen-input-edit-dialog-data.interface';
import { iif, of } from 'rxjs';
import { CUSTOM_UI_COMPONENTS_FORMATTER, EXPRESSION_SCRIPT_FORMATTER } from '../../shared/model-formatters';

type InputType = SInput['type'];

@Component({
  selector: 'step-screen-input-edit-dialog',
  templateUrl: './screen-input-edit-dialog.component.html',
  styleUrls: ['./screen-input-edit-dialog.component.scss'],
})
export class ScreenInputEditDialogComponent implements OnInit {
  private _screenApi = inject(AugmentedScreenService);
  private _matDialogRef = inject(MatDialogRef);
  private _dialogData = inject<ScreenInputEditDialogData>(MAT_DIALOG_DATA);
  readonly modalTitle = `${!!this._dialogData.inputId ? 'Edit' : 'New'} Input`;
  readonly ALLOWED_TYPES: InputType[] = ['DROPDOWN', 'TEXT', 'CHECKBOX'];

  protected screenInput?: ScreenInput;
  protected showAdvanced = false;

  readonly customUIComponentsFormatter = CUSTOM_UI_COMPONENTS_FORMATTER;
  readonly activationExpressionFormatter = EXPRESSION_SCRIPT_FORMATTER;

  ngOnInit(): void {
    this.initScreenInput();
  }

  @HostBinding('keydown.enter')
  save(): void {
    this._screenApi.saveInput(this.screenInput).subscribe(() => this._matDialogRef.close(true));
  }

  private initScreenInput(): void {
    const { screenId, inputId } = this._dialogData;
    const createNew$ = of({ screenId, input: { type: 'TEXT' } } as ScreenInput);
    const openForEdit$ = this._screenApi.getInput(inputId!);
    iif(() => !inputId, createNew$, openForEdit$).subscribe((screenInput) => {
      this.screenInput = screenInput;
    });
  }
}
