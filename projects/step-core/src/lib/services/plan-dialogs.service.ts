import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { AbstractArtefact, AugmentedPlansService, Plan } from '../client/step-client-module';
import { ThreadDistributionWizardDialogComponent } from '../components/thread-distribution-wizard-dialog/thread-distribution-wizard-dialog.component';
import { EntityDialogsService, EntityActionInvokerService } from '../modules/entity/entity.module';
import { IsUsedByDialogService } from './is-used-by-dialog.service';
import { PlanAction } from '../shared';

const PLANS_LIST = '/plans/list';

@Injectable({
  providedIn: 'root',
})
export class PlanDialogsService {
  private _entityActionsInvoker = inject(EntityActionInvokerService);
  private _matDialog = inject(MatDialog);
  private _plansApiService = inject(AugmentedPlansService);
  private _entityDialogs = inject(EntityDialogsService);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _router = inject(Router);

  createPlan(): void {
    this._router.navigateByUrl(`${PLANS_LIST}/new`);
  }

  openThreadGroupDistributionWizard(artefact: AbstractArtefact): Observable<AbstractArtefact | undefined> {
    return this._matDialog.open(ThreadDistributionWizardDialogComponent, { data: artefact }).afterClosed();
  }

  selectPlan(tableFilter?: string): Observable<Plan> {
    const selectedEntity$ = this._entityDialogs.selectEntityOfType('plans', { tableFilter });
    const plan$ = selectedEntity$.pipe(
      map((result) => result.item as Plan),
      switchMap((plan) => this._plansApiService.getPlanById(plan.id!)),
    );
    return plan$;
  }

  duplicatePlan(id: string): Observable<Plan> {
    return this._plansApiService.clonePlan(id).pipe(switchMap((clone) => this._plansApiService.savePlan(clone)));
  }

  deletePlan(plan: Plan): Observable<boolean> {
    return this._entityActionsInvoker.invokeAction('plans', PlanAction.DELETE, plan);
  }

  importPlans(): void {
    this._router.navigateByUrl(`${PLANS_LIST}/import`);
  }

  exportPlans(): void {
    this._router.navigateByUrl(`${PLANS_LIST}/export/all`);
  }

  exportPlan(id: string): void {
    this._router.navigateByUrl(`${PLANS_LIST}/export/${id}`);
  }

  lookUp(id: string, name: string): void {
    this._isUsedByDialogs.displayDialog(`Plan "${name}" is used by`, 'PLAN_ID', id);
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
