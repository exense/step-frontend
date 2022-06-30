import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Parameter, UibModalHelperService, a1Promise2Observable, DialogsService } from '@exense/step-core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParameterDialogsService {
  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService
  ) {}

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
}
