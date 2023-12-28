import { inject, Injectable } from '@angular/core';
import { PlanEditorApiService } from '../../plan-editor/plan-editor.module';
import { from, map, Observable, pipe, tap } from 'rxjs';
import {
  AugmentedInteractivePlanExecutionService,
  AugmentedKeywordsService,
  ExportDialogsService,
  Plan,
  ReportNode,
  RepositoryObjectReference,
  Keyword,
  History,
} from '@exense/step-core';
import { Router } from '@angular/router';

@Injectable()
export class CompositeKeywordPlanApiService implements PlanEditorApiService {
  private _keywordApi = inject(AugmentedKeywordsService);
  private _router = inject(Router);
  private _interactiveApi = inject(AugmentedInteractivePlanExecutionService);
  private _exportDialogs = inject(ExportDialogsService);

  private keyword?: Keyword;

  private readonly getPlanWidthId = pipe(
    tap((keyword: Keyword) => (this.keyword = keyword)),
    map((keyword) => {
      const id = keyword.id!;
      const plan = (keyword as any).plan as Plan;
      return { id, plan };
    })
  );

  private readonly getPlan = pipe(
    this.getPlanWidthId,
    map(({ plan }) => plan)
  );

  clonePlan(id: string): Observable<Plan> {
    return this._keywordApi.cloneFunction(id).pipe(this.getPlan);
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
    return this._exportDialogs.displayExportDialog('Composite Keyword export', `functions`, fileName, id);
  }

  getPlanHistory(id: string): Observable<History[]> {
    return this._keywordApi.getFunctionVersions(id);
  }

  loadPlan(id: string): Observable<Plan> {
    return this._keywordApi.getFunctionById(id).pipe(this.getPlan);
  }

  navigateToPlan(id: string): void {
    const EDITOR_URL = '/composites/editor';
    this._router.navigateByUrl(`${EDITOR_URL}/${id}`);
  }

  restorePlanVersion(id: string, versionId: string): Observable<Plan> {
    return this._keywordApi.restoreFunctionVersion(id, versionId).pipe(this.getPlan);
  }

  savePlan(plan: Plan): Observable<{ id: string; plan: Plan }> {
    const keyword = {
      ...this.keyword!,
      plan,
    } as Keyword;

    return this._keywordApi.saveFunction(keyword).pipe(this.getPlanWidthId);
  }
}
