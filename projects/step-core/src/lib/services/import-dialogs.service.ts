import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UibModalHelperService } from './uib-modal-helper.service';
import { a1Promise2Observable } from '../shared';

@Injectable({
  providedIn: 'root',
})
export class ImportDialogsService {
  constructor(private _uitModalHelper: UibModalHelperService) {}

  displayImportDialog<T>(title: string, path: string): Observable<T> {
    const modalInstance = this._uitModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/importDialog.html',
      controller: 'importModalCtrl',
      resolve: {
        title: () => title,
        path: () => path,
        importAll: () => false,
        overwrite: () => false,
      },
    });
    return a1Promise2Observable(modalInstance.result);
  }
}
