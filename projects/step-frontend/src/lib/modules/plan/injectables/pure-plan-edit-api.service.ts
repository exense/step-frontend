import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import {
  Plan,
  PlansService,
  RepositoryObjectReference,
  History,
  AugmentedInteractivePlanExecutionService,
  ReportNode,
  ExportDialogsService,
  GlobalProgressSpinnerService,
} from '@exense/step-core';
import { Router } from '@angular/router';
import { PlanEditorApiService } from '../../plan-editor/plan-editor.module';

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
    return this._planApi.restorePlanVersion(id, versionId);
  }

  savePlan(plan: Plan): Observable<{ id: string; plan: Plan; forceRefresh?: boolean }> {
    return this._planApi.savePlan(plan).pipe(
      map((response) => ({ id: response.id!, plan: response })),
      catchError(() => {
        this._globalProgressSpinnerService.hideSpinner();
        return this.loadPlan(plan.id!).pipe(
          map((restoredPlan) => {
            return { id: restoredPlan.id!, plan: restoredPlan, forceRefresh: true };
          })
        );
      })
    );
  }

  navigateToPlan(id: string): void {
    const EDITOR_URL = `/plans/editor`;
    this._router.navigateByUrl(`${EDITOR_URL}/${id}`);
  }
}
