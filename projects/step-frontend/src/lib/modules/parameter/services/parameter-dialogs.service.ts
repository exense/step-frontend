import { inject, Injectable } from '@angular/core';
import {
  a1Promise2Observable,
  DialogsService,
  ExportDialogsService,
  ImportDialogsService,
  Parameter,
  ParametersService,
} from '@exense/step-core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
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

  editParameter(parameter?: Partial<Parameter>): Observable<Parameter | undefined> {
    return this._matDialog
      .open(ParameterEditDialogComponent, {
        data: parameter?.id,
      })
      .afterClosed();
  }

  deleteParameter(id: string, label: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Parameter "${label}"`)).pipe(
      switchMap((_) => this._parametersService.deleteParameter(id)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }
}
