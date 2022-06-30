import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resource, UibModalHelperService, a1Promise2Observable, DialogsService } from '@exense/step-core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResourceDialogsService {
  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService
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
}
