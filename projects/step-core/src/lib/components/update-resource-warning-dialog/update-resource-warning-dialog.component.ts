import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertType } from '../../modules/basics/step-basics.module';
import { UpdateResourceWarningResultState } from '../../shared/update-resource-warning-result-state.enum';

@Component({
  selector: 'step-update-resource-warning-dialog',
  templateUrl: './update-resource-warning-dialog.component.html',
  styleUrls: ['./update-resource-warning-dialog.component.scss'],
})
export class UpdateResourceWarningDialogComponent {
  protected _matDialogRef =
    inject<MatDialogRef<UpdateResourceWarningDialogComponent, UpdateResourceWarningResultState>>(MatDialogRef);

  protected readonly AlertType = AlertType;
  protected readonly UpdateResourceWarningResultState = UpdateResourceWarningResultState;
}
