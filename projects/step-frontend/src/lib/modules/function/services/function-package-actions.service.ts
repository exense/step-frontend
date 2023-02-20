import { Injectable } from '@angular/core';
import {
  a1Promise2Observable,
  DialogsService,
  FunctionPackage,
  KeywordPackagesService,
  ResourceInputBridgeService,
  UibModalHelperService,
} from '@exense/step-core';
import { map, Observable, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FunctionPackageActionsService {
  constructor(
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    private _api: KeywordPackagesService,
    private _resourceInputBridgeService: ResourceInputBridgeService
  ) {}

  private openModal<T>(functionPackage?: FunctionPackage, packageId?: string): Observable<T | boolean> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'functionpackages/partials/functionPackageConfigurationDialog.html',
      controller: 'newFunctionPackageModalCtrl',
      resolve: {
        packageId: () => packageId,
        function_: () => functionPackage,
      },
    });

    return a1Promise2Observable<T | boolean>(modalInstance.result).pipe(
      catchError(() => {
        this._resourceInputBridgeService.deleteLastUploadedResource();

        return of(false);
      })
    );
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
