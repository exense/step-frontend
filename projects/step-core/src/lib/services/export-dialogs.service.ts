import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { a1Promise2Observable } from '../shared';
import { UibModalHelperService } from './uib-modal-helper.service';

@Injectable({
  providedIn: 'root',
})
export class ExportDialogsService {
  private _uibModalHelper = inject(UibModalHelperService);

  displayExportDialog(title: string, path: string, filename: string): Observable<boolean | void> {
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

    return a1Promise2Observable<void>(modalInstance.result).pipe(catchError(() => of(false)));
  }
}
