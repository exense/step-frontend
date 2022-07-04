import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Resource,
  UibModalHelperService,
  a1Promise2Observable,
  DialogsService,
  ResourcesService,
  IsUsedByDialogsService,
} from '@exense/step-core';
import { Observable, switchMap, of, catchError, map } from 'rxjs';

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
    private _isUsedByDialogs: IsUsedByDialogsService
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

  searchResource(resource: Resource): Observable<any> {
    return a1Promise2Observable(
      this._isUsedByDialogs.displayDialog(resource.resourceName || '', this.RESOURCE_SEARCH_TYPE, resource.id!)
    );
  }
}
