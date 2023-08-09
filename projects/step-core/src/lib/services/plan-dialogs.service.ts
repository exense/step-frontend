import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { AbstractArtefact, AugmentedPlansService, Plan } from '../client/step-client-module';
import { PlanCreateDialogComponent } from '../components/plan-create-dialog/plan-create-dialog.component';
import { ThreadDistributionWizardDialogComponent } from '../components/thread-distribution-wizard-dialog/thread-distribution-wizard-dialog.component';
import { EntityDialogsService } from '../modules/entity/services/entity-dialogs.service';
import { a1Promise2Observable, AJS_LOCATION, AJS_MODULE, DialogsService } from '../shared';
import { ExportDialogsService } from './export-dialogs.service';
import { ImportDialogsService } from './import-dialogs.service';
import { IsUsedByDialogService } from './is-used-by-dialog.service';
import { MultipleProjectsService } from '../modules/basics/services/multiple-projects.service';
import { PlanLinkDialogService } from '../components/plan-link/plan-link-dialog.service';

@Injectable({
  providedIn: 'root',
})
export class PlanDialogsService implements PlanLinkDialogService {
  private _matDialog = inject(MatDialog);
  private _plansApiService = inject(AugmentedPlansService);
  private _dialogs = inject(DialogsService);
  private _entityDialogs = inject(EntityDialogsService);
  private _exportDialogs = inject(ExportDialogsService);
  private _importDialogs = inject(ImportDialogsService);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _multipleProjects = inject(MultipleProjectsService);
  private _$location = inject(AJS_LOCATION);

  createPlan(): Observable<Plan | undefined> {
    return this._matDialog.open(PlanCreateDialogComponent).afterClosed();
  }

  openThreadGroupDistributionWizard(artefact: AbstractArtefact): Observable<AbstractArtefact | undefined> {
    return this._matDialog.open(ThreadDistributionWizardDialogComponent, { data: artefact }).afterClosed();
  }

  selectPlan(): Observable<Plan> {
    const selectedEntity$ = this._entityDialogs.selectEntityOfType('plans', true);
    const plan$ = selectedEntity$.pipe(
      map((result) => result.item),
      switchMap((id) => this._plansApiService.getPlanById(id))
    );
    return plan$;
  }

  duplicatePlan(id: string): Observable<Plan> {
    return this._plansApiService.clonePlan(id).pipe(switchMap((clone) => this._plansApiService.savePlan(clone)));
  }

  deletePlan(id: string, name: string): Observable<boolean> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Plan "${name}"`)).pipe(
      map(() => true),
      catchError(() => of(false)),
      switchMap((isDeleteConfirmed) =>
        isDeleteConfirmed ? this._plansApiService.deletePlan(id).pipe(map(() => true)) : of(false)
      )
    );
  }

  importPlans(): Observable<boolean | string[]> {
    return this._importDialogs.displayImportDialog('Plans import', 'plans');
  }

  exportPlans(): Observable<boolean> {
    return this._exportDialogs.displayExportDialog('Plans export', 'plans', 'allPlans.sta');
  }

  exportPlan(id: string, name: string): Observable<boolean> {
    return this._exportDialogs.displayExportDialog('Plans export', `plans`, `${name}.sta`, id);
  }

  lookUp(id: string, name: string): void {
    this._isUsedByDialogs.displayDialog(`Plan "${name}" is used by`, 'PLAN_ID', id);
  }

  editPlan(plan: Plan): Observable<boolean> {
    const planEditLink = `/root/plans/editor/${plan.id}`;
    if (this._multipleProjects.isEntityBelongsToCurrentProject(plan)) {
      this._$location.path(planEditLink);
      return of(true);
    }

    return this._multipleProjects.confirmEntityEditInASeparateProject(plan, planEditLink, 'plan').pipe(
      tap((continueEdit) => {
        if (continueEdit) {
          this._$location.path(planEditLink);
        }
      })
    );
  }

  executePlan(planId: string): void {
    this._$location.path(`/root/repository`).search({ repositoryId: 'local', planid: planId });
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('PlanDialogsService', downgradeInjectable(PlanDialogsService));
