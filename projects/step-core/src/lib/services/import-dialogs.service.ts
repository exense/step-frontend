import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { a1Promise2Observable } from '../shared';
import { UibModalHelperService } from './uib-modal-helper.service';
import { ResourceInputBridgeService } from '../modules/resource-input/resource-input.module';

@Injectable({
  providedIn: 'root',
})
export class ImportDialogsService {
  private _uibModalHelper = inject(UibModalHelperService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  displayImportDialog(title: string, path: string): Observable<boolean | string[]> {
    const modalInstance = this._uibModalHelper.open({
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

    return a1Promise2Observable<string[]>(modalInstance.result).pipe(
      catchError(() => {
        this._resourceInputBridgeService.deleteLastUploadedResource();

        return of(false);
      })
    );
  }
}
