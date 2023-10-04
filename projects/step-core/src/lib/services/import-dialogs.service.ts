import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PlanImportDialogComponent } from '../components/plan-import-dialog/plan-import-dialog.component';
import { ImportDialogData } from '../shared/import-dialog-data.interface';

@Injectable({
  providedIn: 'root',
})
export class ImportDialogsService {
  private _matDialog = inject(MatDialog);

  displayImportDialog(title: string, entity: string): Observable<boolean> {
    return this._matDialog
      .open<PlanImportDialogComponent, ImportDialogData, boolean>(PlanImportDialogComponent, {
        data: {
          title,
          entity,
          overwrite: false,
          importAll: false,
        },
        disableClose: true,
      })
      .afterClosed()
      .pipe(map((result) => !!result));
  }
}
