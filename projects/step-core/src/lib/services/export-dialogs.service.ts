import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UibModalHelperService } from './uib-modal-helper.service';
import { a1Promise2Observable } from '../shared';

@Injectable({
  providedIn: 'root',
})
export class ExportDialogsService {
  constructor(private _uibModalHelper: UibModalHelperService) {}

  displayExportDialog<T>(title: string, path: string, filename: string): Observable<T> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/exportDialog.html',
      controller: 'exportModalCtrl',
      resolve: {
        title: () => title,
        path: () => path,
        filename: () => filename,
        recursively: () => true,
        parameters: () => false,
      },
    });

    return a1Promise2Observable(modalInstance);
  }
}
