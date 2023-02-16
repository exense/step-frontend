import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { a1Promise2Observable } from '../shared';
import { ResourceInputBridgeService } from './resource-input-bridge.service';
import { UibModalHelperService } from './uib-modal-helper.service';

@Injectable({
  providedIn: 'root',
})
export class ImportDialogsService {
  constructor(
    private _uitModalHelper: UibModalHelperService,
    private _resourceInputBridgeService: ResourceInputBridgeService
  ) {}

  displayImportDialog<T>(title: string, path: string): Observable<T | boolean> {
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

    return a1Promise2Observable<T | boolean>(modalInstance.result).pipe(
      catchError(() => {
        this._resourceInputBridgeService.deleteLastUploadedResource();

        return of(false);
      })
    );
  }
}
