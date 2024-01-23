import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ImportDialogComponent } from '../components/import-dialog/import-dialog.component';
import { ImportDialogData } from '../shared/import-dialog-data.interface';

@Injectable({
  providedIn: 'root',
})
export class ImportDialogsService {
  private _matDialog = inject(MatDialog);

  displayImportDialog(title: string, entity: string): Observable<boolean> {
    return this._matDialog
      .open<ImportDialogComponent, ImportDialogData, boolean>(ImportDialogComponent, {
        data: {
          title,
          entity,
          overwrite: false,
          importAll: false,
        },
      })
      .afterClosed()
      .pipe(map((result) => !!result));
  }
}
