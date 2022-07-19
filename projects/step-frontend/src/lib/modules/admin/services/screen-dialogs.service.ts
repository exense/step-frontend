import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Input, UibModalHelperService, a1Promise2Observable, DialogsService, ScreensService } from '@exense/step-core';
import { Observable, switchMap, of, catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenDialogsService {
  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    private _screensService: ScreensService
  ) {}

  editScreen(
    screen?: Partial<Input>,
    screenDbId?: string,
    screenChoice?: string
  ): Observable<{ screen?: Partial<Input>; result: string }> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/screenconfiguration/editScreenInputDialog.html',
      controller: 'editScreenInputCtrl',
      resolve: {
        id: function () {
          return screenDbId;
        },
        screenId: function () {
          return screenChoice;
        },
      },
    });

    const result$ = a1Promise2Observable(modalInstance.result) as Observable<string>;
    return result$.pipe(map((result) => ({ result, screen })));
  }

  removeScreen(dbId: string, label: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Screen "${label}"`)).pipe(
      switchMap((_) => this._screensService.deleteInput(dbId)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }
}
