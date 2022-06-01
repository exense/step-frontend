import { Injectable } from '@angular/core';
import { a1Promise2Observable, DialogsService, UibModalHelperService } from '@exense/step-core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlanDialogsService {
  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService
  ) {}

  createPlan(): Observable<any> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/plans/createPlanDialog.html',
      controller: 'createPlanCtrl',
      resolve: {},
    });

    return a1Promise2Observable(modalInstance.result);
  }

  selectPlan(): Observable<any> {
    const selectedEntity$ = a1Promise2Observable<any>(this._dialogs.selectEntityOfType('plans', true));

    const plan$ = selectedEntity$.pipe(
      map((result) => result.item),
      switchMap((id) => this._httpClient.get<any>(`rest/plans/${id}`))
    );
    return plan$;
  }
}
