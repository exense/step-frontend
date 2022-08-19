import { Inject, Injectable } from '@angular/core';
import {
  a1Promise2Observable,
  AJS_FUNCTION_DIALOGS_CONFIG,
  AJS_LOCATION,
  DialogsService,
  FunctionPackage,
  KeywordPackagesService,
  UibModalHelperService,
} from '@exense/step-core';
import { map, Observable, of, switchMap } from 'rxjs';
import { ILocationService } from 'angular';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FunctionPackageActionsService {
  constructor(
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    private _api: KeywordPackagesService,
    @Inject(AJS_FUNCTION_DIALOGS_CONFIG) private _functionDialogsConfig: any,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  private openModal(functionPackage?: FunctionPackage, packageId?: string): Observable<any> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'functionpackages/partials/functionPackageConfigurationDialog.html',
      controller: 'newFunctionPackageModalCtrl',
      resolve: {
        packageId: () => packageId,
        function_: () => functionPackage,
      },
    });

    return a1Promise2Observable(modalInstance.result);
  }

  openAddFunctionPackageDialog(): Observable<any> {
    return this.openModal();
  }

  editFunctionPackage(id: string): Observable<any> {
    return this._api.getFunctionPackage(id).pipe(switchMap((response) => this.openModal(response, id)));
  }

  deleteFunctionPackage(id: string, name: string): Observable<boolean> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Keyword Package "${name}"`)).pipe(
      switchMap((_) => this._api.deleteFunctionPackage(id)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }
}
