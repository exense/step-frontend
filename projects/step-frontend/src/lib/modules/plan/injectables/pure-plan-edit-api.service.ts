import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import {
  Plan,
  PlansService,
  RepositoryObjectReference,
  History,
  AugmentedInteractivePlanExecutionService,
  ReportNode,
  ExportDialogsService,
  GlobalProgressSpinnerService,
  PlanEditorApiService,
} from '@exense/step-core';
import { Router } from '@angular/router';

@Injectable()
export class PurePlanEditApiService implements PlanEditorApiService {
  private _router = inject(Router);
  private _planApi = inject(PlansService);
  private _interactiveApi = inject(AugmentedInteractivePlanExecutionService);
  private _exportDialogs = inject(ExportDialogsService);
  private _globalProgressSpinnerService = inject(GlobalProgressSpinnerService);

  clonePlan(id: string): Observable<Plan> {
    return this._planApi.clonePlan(id);
  }

  createRepositoryObjectReference(id?: string): RepositoryObjectReference | undefined {
    return !id
      ? undefined
      : {
          repositoryID: 'local',
          repositoryParameters: {
            ['planid']: id,
          },
        };
  }

  executeArtefact(sessionId: string, id: string, artefactId: string): Observable<ReportNode> {
    return this._interactiveApi.executeArtefact(sessionId, id, artefactId);
  }

  exportPlan(id: string, fileName: string): Observable<boolean> {
    return this._exportDialogs.displayExportDialog('Plans export', `plans`, fileName, id);
  }

  getPlanHistory(id: string): Observable<History[]> {
    return this._planApi.getPlanVersions(id);
  }

  loadPlan(id: string): Observable<Plan> {
    return this._planApi.getPlanById(id);
  }

  restorePlanVersion(id: string, versionId: string): Observable<Plan> {
    if (versionId) {
      return this._planApi.restorePlanVersion(id, versionId);
    }
    return this._planApi.getPlanById(id);
  }

  getPlanVersion(id: string, plan: Plan): Observable<string> {
    return of(plan.customFields?.['versionId']);
  }

  savePlan(plan: Plan): Observable<{ id: string; plan: Plan; forceRefresh?: boolean }> {
    return this._planApi.savePlan(plan).pipe(
      map((response) => ({ id: response.id!, plan: response })),
      catchError(() => {
        this._globalProgressSpinnerService.hideSpinner();
        return this.loadPlan(plan.id!).pipe(
          map((restoredPlan) => {
            return { id: restoredPlan.id!, plan: restoredPlan, forceRefresh: true };
          }),
        );
      }),
    );
  }

  renamePlan(plan: Plan, name: string): Observable<{ id: string; plan: Plan }> {
    plan.attributes!['name'] = name;
    return this.savePlan(plan);
  }

  navigateToPlan(id: string, enforcePurePlan?: boolean): void {
    const EDITOR_URL = `/plans/editor`;
    this._router.navigateByUrl(`${EDITOR_URL}/${id}`);
  }
}
