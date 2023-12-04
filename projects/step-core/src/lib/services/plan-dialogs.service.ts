import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { AbstractArtefact, AugmentedPlansService, Plan } from '../client/step-client-module';
import { PlanCreateDialogComponent } from '../components/plan-create-dialog/plan-create-dialog.component';
import { PlanLinkDialogService } from '../components/plan-link/plan-link-dialog.service';
import { ThreadDistributionWizardDialogComponent } from '../components/thread-distribution-wizard-dialog/thread-distribution-wizard-dialog.component';
import { AuthService } from '../modules/basics/services/auth.service';
import { MultipleProjectsService } from '../modules/basics/services/multiple-projects.service';
import { EntityDialogsService } from '../modules/entity/services/entity-dialogs.service';
import { AJS_MODULE, DialogsService } from '../shared';
import { ExportDialogsService } from './export-dialogs.service';
import { ImportDialogsService } from './import-dialogs.service';
import { IsUsedByDialogService } from './is-used-by-dialog.service';

const ARTEFACT_ID = 'artefactId';
const EDITOR_URL = '/root/plans/editor';

@Injectable({
  providedIn: 'root',
})
export class PlanDialogsService implements PlanLinkDialogService {
  private _matDialog = inject(MatDialog);
  private _plansApiService = inject(AugmentedPlansService);
  private _dialogs = inject(DialogsService);
  private _entityDialogs = inject(EntityDialogsService);
  private _authService = inject(AuthService);
  private _exportDialogs = inject(ExportDialogsService);
  private _importDialogs = inject(ImportDialogsService);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _multipleProjects = inject(MultipleProjectsService);
  private _router = inject(Router);

  createPlan(): Observable<Plan | undefined> {
    return this._matDialog.open(PlanCreateDialogComponent).afterClosed();
  }

  openThreadGroupDistributionWizard(artefact: AbstractArtefact): Observable<AbstractArtefact | undefined> {
    return this._matDialog.open(ThreadDistributionWizardDialogComponent, { data: artefact }).afterClosed();
  }

  selectPlan(tableFilter?: string): Observable<Plan> {
    const selectedEntity$ = this._entityDialogs.selectEntityOfType('plans', true, { tableFilter });
    const plan$ = selectedEntity$.pipe(
      map((result) => result.item as Plan),
      switchMap((plan) => this._plansApiService.getPlanById(plan.id!))
    );
    return plan$;
  }

  duplicatePlan(id: string): Observable<Plan> {
    return this._plansApiService.clonePlan(id).pipe(switchMap((clone) => this._plansApiService.savePlan(clone)));
  }

  deletePlan(id: string, name: string): Observable<boolean> {
    return this._dialogs
      .showDeleteWarning(1, `Plan "${name}"`)
      .pipe(
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

  editPlan(plan: Plan, artefactId?: string): Observable<boolean> {
    const planEditLink = `${EDITOR_URL}/${plan.id}`;

    if (
      this._authService.hasRight('admin-no-multitenancy') ||
      this._multipleProjects.isEntityBelongsToCurrentProject(plan)
    ) {
      this.openPlanInternal(planEditLink, artefactId);
      return of(true);
    }

    const editLinkParams = !artefactId
      ? planEditLink
      : {
          url: planEditLink,
          search: { [ARTEFACT_ID]: artefactId },
        };

    return this._multipleProjects.confirmEntityEditInASeparateProject(plan, editLinkParams, 'plan').pipe(
      tap((continueEdit) => {
        if (continueEdit) {
          this.openPlanInternal(planEditLink, artefactId);
        }
      })
    );
  }

  executePlan(planId: string): void {
    this._router.navigate(['root', 'repository'], {
      queryParams: {
        repositoryId: 'local',
        planid: planId,
      },
    });
  }

  private openPlanInternal(planEditLink: string, artefactId?: string): void {
    const queryParams = artefactId ? { [ARTEFACT_ID]: artefactId } : undefined;
    const commands = planEditLink.split('/');
    this._router.navigate(commands, { queryParams });
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('PlanDialogsService', downgradeInjectable(PlanDialogsService));
