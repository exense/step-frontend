import { Component, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectSwitchDialogData } from '../../types/project-switch-dialog-data.interface';
import { ProjectSwitchDialogResult } from '../../types/project-switch-dialog-result.enum';

type DialogRef = MatDialogRef<ProjectSwitchDialogComponent, ProjectSwitchDialogResult | undefined>;

@Component({
  selector: 'step-project-switch-dialog',
  templateUrl: './project-switch-dialog.component.html',
  styleUrls: ['./project-switch-dialog.component.scss'],
  standalone: false,
})
export class ProjectSwitchDialogComponent {
  private _dialogRef = inject<DialogRef>(MatDialogRef);

  protected _data = inject<ProjectSwitchDialogData>(MAT_DIALOG_DATA);

  openInCurrent(): void {
    this._dialogRef.close(ProjectSwitchDialogResult.OPEN_IN_CURRENT);
  }

  @HostListener('keydown.enter')
  openInTarget(): void {
    if (!this._data.targetProject) {
      return;
    }
    this._dialogRef.close(ProjectSwitchDialogResult.OPEN_IN_TARGET);
  }
}
