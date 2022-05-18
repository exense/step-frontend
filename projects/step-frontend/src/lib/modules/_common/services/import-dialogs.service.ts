import { a1Promise2Observable, UibModalHelperService } from '@exense/step-core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImportDialogsService {
  constructor(private _uitModalHelper: UibModalHelperService) {}

  displayImportDialog<T>(title: string, path: string, importAll: boolean, overwrite: boolean): Observable<T> {
    const modalInstance = this._uitModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/importDialog.html',
      controller: 'importModalCtrl',
      resolve: {
        title: () => title,
        path: () => path,
        importAll: () => importAll,
        overwrite: () => overwrite,
      },
    });
    return a1Promise2Observable(modalInstance.resolve);
  }
}
