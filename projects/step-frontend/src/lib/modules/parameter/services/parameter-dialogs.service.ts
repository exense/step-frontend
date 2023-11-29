import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogsService,
  ExportDialogsService,
  ImportDialogsService,
  Parameter,
  ParametersService,
} from '@exense/step-core';
import { filter, Observable, switchMap } from 'rxjs';
import { ParameterEditDialogComponent } from '../components/parameter-edit-dialog/parameter-edit-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ParameterDialogsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _importDialogs = inject(ImportDialogsService);
  private _exportDialogs = inject(ExportDialogsService);
  private _parametersService = inject(ParametersService);

  importParameter(): Observable<any> {
    return this._importDialogs.displayImportDialog('Parameters import', 'parameters');
  }

  exportParameter(): Observable<boolean> {
    return this._exportDialogs.displayExportDialog('Parameters export', 'parameters', 'allParameters.sta');
  }

  editParameter(parameterId?: string): Observable<Parameter | undefined> {
    return this._matDialog
      .open(ParameterEditDialogComponent, {
        data: parameterId,
      })
      .afterClosed();
  }

  deleteParameter(id: string, label: string): Observable<any> {
    return this._dialogs.showDeleteWarning(1, `Parameter "${label}"`).pipe(
      filter((result) => result),
      switchMap(() => this._parametersService.deleteParameter(id))
    );
  }
}
