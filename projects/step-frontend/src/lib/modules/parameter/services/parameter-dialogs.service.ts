import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  a1Promise2Observable,
  DialogsService,
  ExportDialogsService,
  ImportDialogsService,
  Parameter,
  ParametersService,
  UibModalHelperService,
} from '@exense/step-core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParameterDialogsService {
  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    private _parameterService: ParametersService,
    private _importDialogs: ImportDialogsService,
    private _exportDialogs: ExportDialogsService,
    private _parametersService: ParametersService
  ) {}

  importParameter(): Observable<any> {
    return this._importDialogs.displayImportDialog('Parameters import', 'parameters');
  }

  exportParameter(): Observable<any> {
    return this._exportDialogs.displayExportDialog('Parameters export', 'parameters', 'allParameters.sta');
  }

  editParameter(parameter?: Partial<Parameter>): Observable<{ parameter?: Partial<Parameter>; result: string }> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/parameters/editParameterDialog.html',
      controller: 'editParameterCtrl',
      resolve: {
        id: function () {
          return parameter?.id;
        },
      },
    });
    const result$ = a1Promise2Observable(modalInstance.result) as Observable<string>;
    return result$.pipe(map((result) => ({ result, parameter: parameter })));
  }

  deleteParameter(id: string, label: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Parameter "${label}"`)).pipe(
      switchMap((_) => this._parametersService.deleteParameter(id)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }
}
