import { Inject, Injectable } from '@angular/core';
import {
  a1Promise2Observable,
  AJS_FUNCTION_DIALOGS_CONFIG,
  AJS_LOCATION,
  AJS_UIB_MODAL,
  DialogsService,
  UibModalHelperService,
} from '@exense/step-core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { ILocationService } from 'angular';

@Injectable({
  providedIn: 'root',
})
export class FunctionDialogsService {
  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    @Inject(AJS_FUNCTION_DIALOGS_CONFIG) public _functionDialogsConfig: any,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  openModal(function_: any, dialogConfig?: any): Observable<any> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/functions/functionConfigurationDialog.html',
      controller: 'newFunctionModalCtrl',
      resolve: {
        function_: () => function_,
        dialogConfig: () => (dialogConfig ? dialogConfig : this._functionDialogsConfig.getDefaultConfig()),
      },
    });

    return a1Promise2Observable(modalInstance.result);
  }

  addFunction(dialogConfig?: any): Observable<any> {
    return this.openModal(null, dialogConfig);
  }

  configureFunction(id: string, dialogConfig?: any): Observable<any> {
    dialogConfig = dialogConfig ? dialogConfig : this._functionDialogsConfig.getDefaultConfig();
    return this._httpClient
      .get<any>(`rest/${dialogConfig.serviceRoot}/${id}`)
      .pipe(switchMap((response) => this.openModal(response, dialogConfig)));
  }

  openFunctionEditor(id: string, dialogConfig?: any) {
    dialogConfig = dialogConfig ? dialogConfig : this._functionDialogsConfig.getDefaultConfig();
    const httpOptions: Object = {
      headers: new HttpHeaders({
        Accept: 'text/html',
        'Content-Type': 'text/plain; charset=utf-8',
      }),
      responseType: 'text',
    };
    return this._httpClient
      .get<string>(`rest/${dialogConfig.serviceRoot}/${id}/editor`, httpOptions)
      .subscribe((path) => {
        console.log('path', path);
        if (path) {
          this._location.path(path);
        } else {
          this._dialogs.showErrorMsg('No editor configured for this function type');
        }
      });
  }

  selectFunction(): Observable<any> {
    const selectedEntity$ = a1Promise2Observable<any>(this._dialogs.selectEntityOfType('function', true));

    const function$ = selectedEntity$.pipe(
      map((result) => result.item),
      switchMap((id) => this._httpClient.get<any>(`rest/functions/${id}`))
    );
    return function$;
  }
}
