import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { AugmentedPlansService, Plan } from '../client/step-client-module';
import { a1Promise2Observable, AJS_MODULE, DialogsService } from '../shared';
import { ExportDialogsService } from './export-dialogs.service';
import { ImportDialogsService } from './import-dialogs.service';
import { IsUsedByDialogService } from './is-used-by-dialog.service';
import { ResourceInputBridgeService } from './resource-input-bridge.service';
import { UibModalHelperService } from './uib-modal-helper.service';
import { EntityDialogsService } from '../modules/entity/services/entity-dialogs.service';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { MatDialog } from '@angular/material/dialog';
import { PlanCreateDialogComponent } from '../components/plan-create-dialog/plan-create-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class PlanDialogsService {
  private _matDialog = inject(MatDialog);
  private _plansApiService = inject(AugmentedPlansService);
  private _uibModalHelper = inject(UibModalHelperService);
  private _dialogs = inject(DialogsService);
  private _entityDialogs = inject(EntityDialogsService);
  private _exportDialogs = inject(ExportDialogsService);
  private _importDialogs = inject(ImportDialogsService);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  createPlan(): Observable<any> {
    return this._matDialog.open(PlanCreateDialogComponent).afterClosed();
  }

  selectPlan(): Observable<Plan> {
    const selectedEntity$ = this._entityDialogs.selectEntityOfType('plans', true);
    const plan$ = selectedEntity$.pipe(
      map((result) => result.item),
      switchMap((id) => this._plansApiService.getPlanById(id))
    );
    return plan$;
  }

  duplicatePlan(id: string): Observable<any> {
    return this._plansApiService.clonePlan(id).pipe(switchMap((clone) => this._plansApiService.savePlan(clone)));
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

getAngularJSGlobal().module(AJS_MODULE).service('PlanDialogsService', downgradeInjectable(PlanDialogsService));
