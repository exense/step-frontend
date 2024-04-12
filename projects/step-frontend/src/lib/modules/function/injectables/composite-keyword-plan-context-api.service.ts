import { inject, Injectable } from '@angular/core';
import { map, Observable, of, pipe } from 'rxjs';
import {
  AugmentedInteractivePlanExecutionService,
  AugmentedKeywordsService,
  ExportDialogsService,
  ReportNode,
  RepositoryObjectReference,
  Keyword,
  History,
  PlanContextApiService,
  PlanContext,
  Plan,
  CompositesService,
} from '@exense/step-core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CompositeKeywordPlanContextApiService implements PlanContextApiService {
  private _keywordApi = inject(AugmentedKeywordsService);
  private _router = inject(Router);
  private _interactiveApi = inject(AugmentedInteractivePlanExecutionService);
  private _exportDialogs = inject(ExportDialogsService);
  private _compositeApi = inject(CompositesService);

  private mapToContext = (overrideId?: string) =>
    pipe(map((keyword: Keyword) => this.createContext(keyword, overrideId)));

  clonePlan(id: string): Observable<PlanContext> {
    return this._keywordApi.cloneFunction(id).pipe(this.mapToContext());
  }

  createContextDuplicate(context: PlanContext): PlanContext {
    const keyword = JSON.parse(JSON.stringify(context.entity)) as Keyword;
    return this.createContext(keyword, context.id);
  }

  createRepositoryObjectReference(id?: string): RepositoryObjectReference | undefined {
    return {
      repositoryID: 'local',
      repositoryParameters: {},
    };
  }

  executeArtefact(sessionId: string, id: string, artefactId: string): Observable<ReportNode> {
    return this._interactiveApi.executeCompositeFunction(sessionId, id, artefactId);
  }

  exportPlan(id: string, fileName: string): Observable<boolean> {
    return this._exportDialogs.displayExportDialog('Composite Keyword export', 'functions', fileName, id);
  }

  getPlanHistory(id: string): Observable<History[]> {
    return this._keywordApi.getFunctionVersions(id);
  }

  loadPlan(id: string): Observable<PlanContext> {
    return this._keywordApi.getFunctionById(id).pipe(this.mapToContext());
  }

  navigateToPlan(id: string, enforcePurePlan?: boolean): void {
    const EDITOR_URL = enforcePurePlan ? '/plans/editor' : '/composites/editor';
    this._router.navigateByUrl(`${EDITOR_URL}/${id}`);
  }

  restorePlanVersion(id: string, versionId: string): Observable<PlanContext> {
    const keyword$ = !!versionId
      ? this._keywordApi.restoreFunctionVersion(id, versionId)
      : this._keywordApi.getFunctionById(id);

    return keyword$.pipe(this.mapToContext());
  }

  getPlanVersion(id: string, context: PlanContext): Observable<string> {
    const keyword = context.entity as unknown as Keyword;
    return of(keyword?.customFields?.['versionId']);
  }

  savePlan(context: PlanContext): Observable<PlanContext & { forceRefresh?: boolean }> {
    const keyword = context.entity as unknown as Keyword;
    return this._keywordApi.saveFunction(keyword).pipe(this.mapToContext());
  }

  renamePlan(context: PlanContext, name: string): Observable<PlanContext> {
    const keyword = context.entity as unknown as Keyword;
    keyword.attributes!['name'] = name;
    return this._keywordApi.saveFunction(keyword).pipe(this.mapToContext());
  }

  lookupPlan(id: string, artefactId: string): Observable<Plan> {
    return this._compositeApi.lookupPlan1(id, artefactId);
  }

  private createContext(keyword: Keyword, overrideId?: string): PlanContext {
    const id = (keyword?.id ?? overrideId)!;
    const entity = keyword;
    const plan = (keyword as any).plan;
    const entityType = 'functions';
    return { id, plan, entity, entityType };
  }
}
