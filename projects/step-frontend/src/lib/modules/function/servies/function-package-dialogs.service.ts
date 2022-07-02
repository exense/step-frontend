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
export class FunctionPackageDialogsService {
  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    @Inject(AJS_FUNCTION_DIALOGS_CONFIG) private _functionDialogsConfig: any,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  openModal(function_?: any, packageId?: string): Observable<any> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'functionpackages/partials/functionPackageConfigurationDialog.html',
      controller: 'newFunctionPackageModalCtrl',
      resolve: {
        packageId: () => packageId,
        function_: () => function_,
      },
    });

    return a1Promise2Observable(modalInstance.result);
  }

  addFunctionPackage(): Observable<any> {
    return this.openModal();
  }

  editFunctionPackage(id: string): Observable<any> {
    return this._httpClient
      .get<any>(`rest/functionpackages/${id}`)
      .pipe(switchMap((response) => this.openModal(response, id)));
  }
}
