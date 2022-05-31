import { Injectable } from '@angular/core';
import { a1Promise2Observable, UibModalHelperService } from '@exense/step-core';
import { IsUsedByType } from '../shared/is-used-by-type.enum';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IsUsedByDialogsService {
  constructor(private _uibModalHelper: UibModalHelperService) {}

  displayDialog<T>(title: string, type: IsUsedByType, id: string): Observable<T> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/isUsedByDialog.html',
      controller: 'isUsedByDialogCtrl',
      resolve: {
        title: () => title,
        type: () => type,
        id: () => id,
      },
    });
    return a1Promise2Observable(modalInstance.result);
  }
}
