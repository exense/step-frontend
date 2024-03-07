import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ImportDialogComponent } from '../components/import-dialog/import-dialog.component';
import { ImportDialogData } from '../types/import-dialog-data.interface';
import { DialogRouteResult } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class ImportDialogsService {
  private _matDialog = inject(MatDialog);

  displayImportDialog(title: string, entity: string): Observable<boolean> {
    return this._matDialog
      .open<ImportDialogComponent, ImportDialogData, DialogRouteResult>(ImportDialogComponent, {
        data: {
          title,
          entity,
          overwrite: false,
          importAll: false,
        },
      })
      .afterClosed()
      .pipe(map((result) => !!result?.isSuccess));
  }
}
