import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ExportDialogData } from '../types/export-dialog-data.interface';
import { MatDialog } from '@angular/material/dialog';
import { ExportDialogComponent } from '../components/export-dialog/export-dialog.component';
import { DialogRouteResult } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class ExportDialogsService {
  private _madDialog = inject(MatDialog);

  displayExportDialog(title: string, entity: string, filename: string, id?: string): Observable<boolean> {
    return this._madDialog
      .open<ExportDialogComponent, ExportDialogData, DialogRouteResult>(ExportDialogComponent, {
        data: {
          title,
          entity,
          filename,
          id,
        },
      })
      .afterClosed()
      .pipe(map((result) => !!result?.isSuccess));
  }
}
