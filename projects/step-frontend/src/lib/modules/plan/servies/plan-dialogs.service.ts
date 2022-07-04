import { Injectable } from '@angular/core';
import { a1Promise2Observable, AugmentedPlansService, DialogsService, UibModalHelperService } from '@exense/step-core';
import { map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlanDialogsService {
  constructor(
    private _augmentedPlansService: AugmentedPlansService,
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
      switchMap((id) => this._augmentedPlansService.get5(id))
    );
    return plan$;
  }
}
