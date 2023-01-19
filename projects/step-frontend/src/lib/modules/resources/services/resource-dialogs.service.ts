import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  a1Promise2Observable,
  DialogsService,
  IsUsedByDialogService,
  Resource,
  ResourcesService,
  UibModalHelperService,
} from '@exense/step-core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SearchResourceDialogComponent } from '../components/search-resource-dialog/search-resource-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ResourceDialogsService {
  readonly RESOURCE_SEARCH_TYPE = 'RESOURCE_ID';

  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    private _resourcesService: ResourcesService,
    private _isUsedByDialogs: IsUsedByDialogService,
    private _matDialog: MatDialog
  ) {}

  editResource(resource?: Partial<Resource>): Observable<{ resource?: Partial<Resource>; result: string }> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/resources/editResourceDialog.html',
      controller: 'editResourceCtrl',
      resolve: {
        id: function () {
          return resource?.id;
        },
      },
    });

    const result$ = a1Promise2Observable(modalInstance.result) as Observable<string>;
    return result$.pipe(map((result) => ({ result, resource: resource })));
  }

  deleteResource(id: string, label: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Resource "${label}"`)).pipe(
      switchMap((_) => this._resourcesService.deleteResource(id)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }

  searchResource(resource: Resource): void {
    this._isUsedByDialogs.displayDialog(resource.resourceName || '', this.RESOURCE_SEARCH_TYPE, resource.id!);
  }

  showSearchResourceDialog(type: string): Observable<string> {
    const dialogRef = this._matDialog.open(SearchResourceDialogComponent, { data: type });
    return dialogRef.afterClosed() as Observable<string>;
  }

  showFileAlreadyExistsWarning(similarResources: Resource[]): Observable<string> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/resources/fileAlreadyExistsWarning.html',
      controller: 'fileAlreadyExistsWarningCtrl',
      resolve: {
        similarResources: () => {
          return similarResources;
        },
      },
    });

    return a1Promise2Observable(modalInstance.result) as Observable<string>;
  }

  showUpdateResourceWarning(resource?: Resource): Observable<boolean> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/resources/updateResourceWarning.html',
      controller: 'updateResourceWarningCtrl',
      resolve: {
        resource: () => {
          return resource;
        },
      },
    });

    return a1Promise2Observable(modalInstance.result) as Observable<boolean>;
  }
}
