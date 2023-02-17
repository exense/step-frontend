import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { AugmentedPlansService, Plan } from '../client/step-client-module';
import { a1Promise2Observable, DialogsService } from '../shared';
import { ExportDialogsService } from './export-dialogs.service';
import { ImportDialogsService } from './import-dialogs.service';
import { IsUsedByDialogService } from './is-used-by-dialog.service';
import { ResourceInputBridgeService } from './resource-input-bridge.service';
import { UibModalHelperService } from './uib-modal-helper.service';

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
    private _isUsedByDialogs: IsUsedByDialogService,
    private _resourceInputBridgeService: ResourceInputBridgeService
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

  selectPlan(): Observable<Plan> {
    const selectedEntity$ = a1Promise2Observable<any>(this._dialogs.selectEntityOfType('plans', true));
    const plan$ = selectedEntity$.pipe(
      map((result) => result.item),
      switchMap((id) => this._plansApiService.getPlanById(id))
    );
    return plan$;
  }

  duplicatePlan(id: string): Observable<any> {
    return this._plansApiService.clonePlan(id).pipe(
      map((clone: Plan) => {
        clone['attributes']!['name']! += '_Copy';
        return clone;
      }),
      switchMap((clone) => this._plansApiService.savePlan(clone))
    );
  }

  deletePlan(id: string, name: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Plan "${name}"`)).pipe(
      map((_) => true),
      catchError((_) => of(false)),
      tap((isDeleteConfirmed) => console.log('IS DELETE CONFIRMED', isDeleteConfirmed)),
      switchMap((isDeleteConfirmed) =>
        isDeleteConfirmed ? this._plansApiService.deletePlan(id).pipe(map((_) => true)) : of(false)
      )
    );
  }

  importPlans(): Observable<any> {
    return this._importDialogs.displayImportDialog('Plans import', 'plans').pipe(
      catchError(() => {
        this._resourceInputBridgeService.deleteLastUploadedResource();

        return of(false);
      })
    );
  }

  exportPlans(): Observable<any> {
    return this._exportDialogs.displayExportDialog('Plans export', 'plans', 'allPlans.sta');
  }

  exportPlan(id: string, name: string): Observable<any> {
    return this._exportDialogs.displayExportDialog('Plans export', `plans/${id}`, `${name}.sta`);
  }

  lookUp(id: string, name: string): void {
    this._isUsedByDialogs.displayDialog(`Plan "${name}" is used by`, 'PLAN_ID', id);
  }
}
