import { Observable, tap } from 'rxjs';
import { Component, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportDialogData } from '../../shared/import-dialog-data.interface';
import { AlertType } from '../../modules/basics/step-basics.module';
import { ImportsService } from '../../client/step-client-module';
import { DialogsService } from '../../shared';

@Component({
  selector: 'step-plan-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
})
export class ImportDialogComponent {
  private _matDialogRef = inject<MatDialogRef<ImportDialogComponent, boolean>>(MatDialogRef);
  private _dialogs = inject(DialogsService);
  private _data = inject<ImportDialogData>(MAT_DIALOG_DATA);
  private _importsService = inject(ImportsService);

  protected showOptions = true;
  protected isImporting = false;
  protected resourcePath!: string;
  protected importAll = this._data.importAll;
  protected overwrite = this._data.overwrite;

  readonly title = this._data.title;
  readonly entity = this._data.entity;
  readonly AlertType = AlertType;

  @HostListener('keydown.enter')
  save(): void {
    if (!this.resourcePath) {
      this._dialogs.showErrorMsg('Upload not completed.');
      return;
    }
    this.invokeImport()
      .pipe(
        tap(() => {
          this.isImporting = true;
        })
      )
      .subscribe({
        next: (response: string[]) => {
          this._matDialogRef.close();
          if (!!response?.length) {
            this._dialogs.showListOfMsgs(response);
          }
        },
        complete: () => {
          this.isImporting = false;
        },
        error: (error: unknown) => console.error(error),
      });
  }

  private invokeImport(): Observable<string[]> {
    const { entity } = this._data;

    return this._importsService.importEntity(entity, this.resourcePath, this.importAll, this.overwrite);
  }
}
