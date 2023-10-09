import { Observable, tap } from 'rxjs';
import { Component, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertType, DialogsService, ImportsService } from '@exense/step-core';
import { ImportDialogData } from '../../shared/import-dialog-data.interface';

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
    if (this.resourcePath) {
      this.invokeImport()
        .pipe(
          tap(() => {
            this.isImporting = true;
          })
        )
        .subscribe({
          next: (response: any) => {
            this._matDialogRef.close();

            if (response && response.length > 0) {
              this._dialogs.showListOfMsgs(response);
            }
          },
          complete: () => {
            this.isImporting = false;
          },
          error: (error: any) => console.error(error),
        });
    } else {
      this._dialogs.showErrorMsg('Upload not completed.');
    }
  }

  private invokeImport(): Observable<string[]> {
    const { entity } = this._data;

    return this._importsService.importEntity(entity, this.resourcePath, this.importAll, this.overwrite);
  }
}
