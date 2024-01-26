import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { AbstractArtefact, AugmentedPlansService, Plan } from '../client/step-client-module';
import { PlanCreateDialogComponent } from '../components/plan-create-dialog/plan-create-dialog.component';
import { PlanLinkDialogService } from '../components/plan-link/plan-link-dialog.service';
import { ThreadDistributionWizardDialogComponent } from '../components/thread-distribution-wizard-dialog/thread-distribution-wizard-dialog.component';
import { EntityDialogsService, EntityActionInvokerService } from '../modules/entity/entity.module';
import { ExportDialogsService } from './export-dialogs.service';
import { ImportDialogsService } from './import-dialogs.service';
import { IsUsedByDialogService } from './is-used-by-dialog.service';
import { PlanAction } from '../shared';

@Injectable({
  providedIn: 'root',
})
export class PlanDialogsService implements PlanLinkDialogService {
  private _entityActionsInvoker = inject(EntityActionInvokerService);
  private _matDialog = inject(MatDialog);
  private _plansApiService = inject(AugmentedPlansService);
  private _entityDialogs = inject(EntityDialogsService);
  private _exportDialogs = inject(ExportDialogsService);
  private _importDialogs = inject(ImportDialogsService);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _router = inject(Router);

  createPlan(): Observable<Plan | undefined> {
    return this._matDialog.open(PlanCreateDialogComponent).afterClosed();
  }

  openThreadGroupDistributionWizard(artefact: AbstractArtefact): Observable<AbstractArtefact | undefined> {
    return this._matDialog.open(ThreadDistributionWizardDialogComponent, { data: artefact }).afterClosed();
  }

  selectPlan(tableFilter?: string): Observable<Plan> {
    const selectedEntity$ = this._entityDialogs.selectEntityOfType('plans', { tableFilter });
    const plan$ = selectedEntity$.pipe(
      map((result) => result.item as Plan),
      switchMap((plan) => this._plansApiService.getPlanById(plan.id!))
    );
    return plan$;
  }

  duplicatePlan(id: string): Observable<Plan> {
    return this._plansApiService.clonePlan(id).pipe(switchMap((clone) => this._plansApiService.savePlan(clone)));
  }

  deletePlan(plan: Plan): Observable<boolean> {
    return this._entityActionsInvoker.invokeAction('plans', PlanAction.DELETE, plan);
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

  editPlan(plan: Plan, artefactId?: string): Observable<boolean> {
    return this._entityActionsInvoker.invokeAction('plans', PlanAction.EDIT, plan, { artefactId });
  }

  executePlan(planId: string): void {
    this._router.navigate(['repository'], {
      queryParams: {
        repositoryId: 'local',
        planid: planId,
      },
    });
  }
}
