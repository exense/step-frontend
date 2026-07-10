import { Component, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, Observable, of, switchMap, tap } from 'rxjs';
import { ImportsService } from '../../../../client/step-client-module';
import { ImportDialogData } from '../../types/import-dialog-data.interface';
import { StepBasicsModule, AlertType, DialogsService, DialogRouteResult } from '../../../basics/step-basics.module';
import { ResourceInputComponent } from '../../../resource-input';

@Component({
  selector: 'step-plan-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
  imports: [StepBasicsModule, ResourceInputComponent],
})
export class ImportDialogComponent {
  private _matDialogRef = inject<MatDialogRef<ImportDialogComponent, DialogRouteResult>>(MatDialogRef);
  private _dialogs = inject(DialogsService);
  private _data = inject<ImportDialogData>(MAT_DIALOG_DATA);
  private _importsService = inject(ImportsService);

  protected showOptions = true;
  protected isImporting = false;
  protected resourcePath!: string;
  protected importAll = this._data.importAll;
  protected overwrite = this._data.overwrite;

  protected readonly title = this._data.title;
  protected readonly entity = this._data.entity;
  protected readonly AlertType = AlertType;

  @HostListener('keydown.enter')
  protected save(): void {
    if (this.isImporting) {
      return;
    }

    if (!this.resourcePath) {
      this._dialogs.showErrorMsg('Upload not completed.').subscribe();
      return;
    }

    this.isImporting = true;
    this._matDialogRef.disableClose = true;

    this.invokeImport()
      .pipe(
        tap(() => this._matDialogRef.close({ isSuccess: true })),
        switchMap((response) => (!!response?.length ? this._dialogs.showListOfMsgs(response) : of(undefined))),
        finalize(() => {
          this.isImporting = false;
          this._matDialogRef.disableClose = false;
        }),
      )
      .subscribe({
        error: () => undefined,
      });
  }

  private invokeImport(): Observable<string[]> {
    const { entity } = this._data;

    return this._importsService.importEntity(entity, this.resourcePath, this.importAll, this.overwrite);
  }
}
