import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, switchMap, map, Observable, of, pipe, tap, filter } from 'rxjs';
import {
  AugmentedInteractivePlanExecutionService,
  AugmentedKeywordsService,
  ExportDialogsService,
  Plan,
  ReportNode,
  RepositoryObjectReference,
  Keyword,
  History,
  PlanEditorApiService,
  CompositesService,
  PlansService,
} from '@exense/step-core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CompositeKeywordPlanApiService implements PlanEditorApiService, OnDestroy {
  private _keywordApi = inject(AugmentedKeywordsService);
  private _compositeApi = inject(CompositesService);
  private _planApi = inject(PlansService);
  private _router = inject(Router);
  private _interactiveApi = inject(AugmentedInteractivePlanExecutionService);
  private _exportDialogs = inject(ExportDialogsService);

  private keywordInternal$ = new BehaviorSubject<Keyword | undefined>(undefined);

  ngOnDestroy(): void {
    this.keywordInternal$.complete();
  }

  readonly keyword$ = this.keywordInternal$.asObservable();

  private readonly getPlanWithId = pipe(
    tap((keyword: Keyword) => this.keywordInternal$.next(keyword)),
    map((keyword) => {
      const id = keyword.id!;
      const plan = (keyword as any).plan as Plan;
      return { id, plan };
    }),
  );

  private readonly getPlan = pipe(
    this.getPlanWithId,
    map(({ plan }) => plan),
  );

  clonePlan(id: string): Observable<Plan> {
    return this._compositeApi.cloneCompositePlan(id);
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
    return this.keyword$.pipe(
      map((keyword) => keyword!),
      switchMap((keyword: Keyword) => this._keywordApi.getFunctionVersions(keyword.id!)),
    );
  }

  loadPlan(id: string): Observable<Plan> {
    return this._keywordApi.getFunctionById(id).pipe(this.getPlan);
  }

  navigateToPlan(id: string, enforcePurePlan?: boolean): void {
    const EDITOR_URL = enforcePurePlan ? '/plans/editor' : '/composites/editor';
    this._router.navigateByUrl(`${EDITOR_URL}/${id}`);
  }

  restorePlanVersion(id: string, versionId: string): Observable<Plan> {
    if (versionId) {
      return this.keyword$.pipe(
        map((keyword) => keyword!),
        switchMap((keyword: Keyword) => this._keywordApi.restoreFunctionVersion(keyword.id!, versionId)),
        this.getPlan,
      );
    }
    return this.keyword$.pipe(
      map((keyword) => keyword!),
      this.getPlan,
    );
  }

  getPlanVersion(id: string, plan: Plan): Observable<string> {
    return this._keywordApi.getFunctionById(id).pipe(map((keyword) => keyword?.customFields?.['versionId']));
  }

  savePlan(plan: Plan): Observable<{ id: string; plan: Plan }> {
    const keyword = {
      ...this.keywordInternal$.value!,
      plan,
    } as Keyword;

    return this._keywordApi.saveFunction(keyword).pipe(this.getPlanWithId);
  }

  renamePlan(plan: Plan, name: string): Observable<{ id: string; plan: Plan }> {
    plan.attributes!['name'] = name;
    return this._planApi.savePlan(plan).pipe(
      map((plan: Plan) => {
        return { id: plan.id!, plan };
      }),
    );
  }
}
