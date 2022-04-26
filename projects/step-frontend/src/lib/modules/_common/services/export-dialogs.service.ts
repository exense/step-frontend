import { Injectable } from '@angular/core';
import { a1Promise2Observable, UibModalHelperService } from '@exense/step-core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExportDialogsService {
  constructor(private _uibModalHelper: UibModalHelperService) {}

  displayExportDialog<T>(
    title: string,
    path: string,
    filename: string,
    recursively: boolean,
    parameters: boolean
  ): Observable<T> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/exportDialog.html',
      controller: 'exportModalCtrl',
      resolve: {
        title: () => title,
        path: () => path,
        filename: () => filename,
        recursively: () => recursively,
        parameters: () => parameters,
      },
    });

    return a1Promise2Observable(modalInstance);
  }
}
