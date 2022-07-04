import { Injectable } from '@angular/core';
import {
  a1Promise2Observable,
  AugmentedPlansService,
  DialogsService,
  Plan,
  UibModalHelperService,
} from '@exense/step-core';
import { Observable, catchError, map, noop, of, switchMap, tap } from 'rxjs';
import { ExportDialogsService } from '../../_common/services/export-dialogs.service';
import { ImportDialogsService } from '../../_common/services/import-dialogs.service';
import { IsUsedByDialogsService } from '../../_common/services/is-used-by-dialogs.service';
import { IsUsedByType } from '../../_common/shared/is-used-by-type.enum';

@Injectable({
  providedIn: 'root',
})
export class PlanDialogsService {
  constructor(
    private _plansApiService: AugmentedPlansService,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    private _exportDialogs: ExportDialogsService,
    private _importDialogs: ImportDialogsService,
    private _isUsedByDialogs: IsUsedByDialogsService
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
      switchMap((id) => this._plansApiService.get5(id))
    );
    return plan$;
  }

  duplicatePlan(id: string): Observable<any> {
    return this._plansApiService.clonePlan(id).pipe(
      map((clone: Plan) => {
        clone['attributes']!['name']! += '_Copy';
        return clone;
      }),
      switchMap((clone) => this._plansApiService.save4(clone))
    );
  }

  deletePlan(id: string, name: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Plan "${name}"`)).pipe(
      map((_) => true),
      catchError((_) => of(false)),
      tap((isDeleteConfirmed) => console.log('IS DELETE CONFIRMED', isDeleteConfirmed)),
      switchMap((isDeleteConfirmed) =>
        isDeleteConfirmed ? this._plansApiService.delete3(id).pipe(map((_) => true)) : of(false)
      )
    );
  }

  importPlans(): Observable<any> {
    return this._importDialogs.displayImportDialog('Plans import', 'plans', true, false);
  }

  exportPlans(): Observable<any> {
    return this._exportDialogs.displayExportDialog('Plans export', 'plans', 'allPlans.sta', true, false);
  }

  exportPlan(id: string, name: string): Observable<any> {
    return this._exportDialogs.displayExportDialog('Plans export', `plans/${id}`, `${name}.sta`, true, false);
  }

  lookUp(id: string, name: string): Observable<any> {
    return this._isUsedByDialogs.displayDialog(`Plan "${name}" is used by`, IsUsedByType.PLAN_ID, id);
  }
}
