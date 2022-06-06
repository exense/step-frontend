import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ScreenInputDto, UibModalHelperService, a1Promise2Observable } from '@exense/step-core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenDialogsService {
  constructor(private _httpClient: HttpClient, private _uibModalHelper: UibModalHelperService) {}

  editScreen(
    screen?: Partial<ScreenInputDto & { dbId: string }>,
    screenChoice?: string
  ): Observable<{ screen: Partial<ScreenInputDto>; result: string }> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/screenconfiguration/editScreenInputDialog.html',
      controller: 'editScreenInputCtrl',
      resolve: {
        id: function () {
          return screen ? screen['dbId'] : null;
        },
        screenId: function () {
          return screenChoice;
        },
      },
    });

    const result$ = a1Promise2Observable(modalInstance.result) as Observable<string>;
    return result$.pipe(map((result) => ({ result, screen })));
  }
}
