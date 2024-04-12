import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, pipe } from 'rxjs';
import {
  Plan,
  RepositoryObjectReference,
  History,
  AugmentedInteractivePlanExecutionService,
  ReportNode,
  ExportDialogsService,
  GlobalProgressSpinnerService,
  PlanContextApiService,
  PlanContext,
  AugmentedPlansService,
} from '@exense/step-core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PurePlanContextApiService implements PlanContextApiService {
  private _router = inject(Router);
  private _planApi = inject(AugmentedPlansService);
  private _interactiveApi = inject(AugmentedInteractivePlanExecutionService);
  private _exportDialogs = inject(ExportDialogsService);
  private _globalProgressSpinnerService = inject(GlobalProgressSpinnerService);

  private mapToContext = (overrideId?: string) => pipe(map((plan: Plan) => this.createContext(plan, overrideId)));

  clonePlan(id: string): Observable<PlanContext> {
    return this._planApi.clonePlan(id).pipe(this.mapToContext());
  }

  createContextDuplicate(context: PlanContext): PlanContext {
    const plan = !!context.plan ? JSON.parse(JSON.stringify(context.plan)) : undefined;
    return this.createContext(plan, context.id);
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

  loadPlan(id: string): Observable<PlanContext> {
    return this._planApi.getPlanById(id).pipe(this.mapToContext());
  }

  lookupPlan(id: string, artefactId: string): Observable<Plan> {
    return this._planApi.lookupPlan(id, artefactId);
  }

  restorePlanVersion(id: string, versionId: string): Observable<PlanContext> {
    const plan$ = !!versionId ? this._planApi.restorePlanVersion(id, versionId) : this._planApi.getPlanById(id);

    return plan$.pipe(this.mapToContext(id));
  }

  getPlanVersion(id: string, context: PlanContext): Observable<string> {
    return of(context.plan?.customFields?.['versionId']);
  }

  savePlan({ id, plan }: PlanContext): Observable<PlanContext & { forceRefresh?: boolean }> {
    plan!.id = id;
    return this._planApi.savePlan(plan).pipe(
      this.mapToContext(),
      catchError(() => {
        this._globalProgressSpinnerService.hideSpinner();
        return this._planApi.getPlanById(id!).pipe(
          this.mapToContext(),
          map((context) => ({ ...context, forceRefresh: true })),
        );
      }),
    );
  }

  renamePlan(context: PlanContext, name: string): Observable<PlanContext> {
    context.plan!.attributes!['name'] = name;
    return this.savePlan(context);
  }

  navigateToPlan(id: string, enforcePurePlan?: boolean): void {
    const EDITOR_URL = `/plans/editor`;
    this._router.navigateByUrl(`${EDITOR_URL}/${id}`);
  }

  createContext(plan: Plan, overrideId?: string): PlanContext {
    const id = (plan?.id ?? overrideId)!;
    const entity = plan;
    const entityType = 'plans';
    return { id, plan, entity, entityType };
  }
}
