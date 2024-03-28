import { Component, HostBinding, inject } from '@angular/core';
import {
  AugmentedScreenService,
  DialogRouteResult,
  Input as SInput,
  CUSTOM_UI_COMPONENTS_FORMATTER,
  EXPRESSION_SCRIPT_FORMATTER,
} from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ScreenInputEditDialogData } from '../../types/screen-input-edit-dialog-data.interface';

type InputType = SInput['type'];
type DialogRef = MatDialogRef<ScreenInputEditDialogComponent, DialogRouteResult>;

@Component({
  selector: 'step-screen-input-edit-dialog',
  templateUrl: './screen-input-edit-dialog.component.html',
  styleUrls: ['./screen-input-edit-dialog.component.scss'],
})
export class ScreenInputEditDialogComponent {
  private _screenApi = inject(AugmentedScreenService);
  private _matDialogRef = inject<DialogRef>(MatDialogRef);
  private _dialogData = inject<ScreenInputEditDialogData>(MAT_DIALOG_DATA);
  protected screenInput = this._dialogData.screenInput;
  readonly modalTitle = `${!!this.screenInput.id ? 'Edit' : 'New'} Input`;
  readonly ALLOWED_TYPES: InputType[] = ['DROPDOWN', 'TEXT', 'CHECKBOX'];

  protected showAdvanced = false;

  readonly customUIComponentsFormatter = CUSTOM_UI_COMPONENTS_FORMATTER;
  readonly activationExpressionFormatter = EXPRESSION_SCRIPT_FORMATTER;

  @HostBinding('keydown.enter')
  save(): void {
    this._screenApi.saveInput(this.screenInput).subscribe(() => this._matDialogRef.close({ isSuccess: true }));
  }
}
