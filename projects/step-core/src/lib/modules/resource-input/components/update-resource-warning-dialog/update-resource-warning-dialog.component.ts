import { AfterViewInit, Component, HostListener, inject, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertType, ModalWindowComponent, StepBasicsModule } from '../../../../modules/basics/step-basics.module';
import { UpdateResourceWarningResultState } from '../../types/update-resource-warning-result-state.enum';

@Component({
  selector: 'step-update-resource-warning-dialog',
  templateUrl: './update-resource-warning-dialog.component.html',
  styleUrls: ['./update-resource-warning-dialog.component.scss'],
  standalone: true,
  imports: [StepBasicsModule],
})
export class UpdateResourceWarningDialogComponent implements AfterViewInit {
  @ViewChild(ModalWindowComponent, { static: true })
  private modalWindow!: ModalWindowComponent;

  protected _matDialogRef =
    inject<MatDialogRef<UpdateResourceWarningDialogComponent, UpdateResourceWarningResultState>>(MatDialogRef);

  protected readonly AlertType = AlertType;

  ngAfterViewInit(): void {
    this.modalWindow.focusDialog();
  }

  @HostListener('keydown.enter')
  update(): void {
    this._matDialogRef.close(UpdateResourceWarningResultState.UPDATE_RESOURCE);
  }

  create(): void {
    this._matDialogRef.close(UpdateResourceWarningResultState.NEW_RESOURCE);
  }
}
