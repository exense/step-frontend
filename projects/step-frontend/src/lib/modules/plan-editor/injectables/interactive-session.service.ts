import { computed, inject, Injectable, OnDestroy, signal, untracked } from '@angular/core';
import {
  AugmentedInteractivePlanExecutionService,
  AugmentedScreenService,
  ExecutionParameters,
  RepositoryObjectReference,
  PlanContextApiService,
} from '@exense/step-core';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { KeywordParameters } from '../../execution/shared/keyword-parameters';
import { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../execution/shared/type-leaf-report-nodes-table-params';

@Injectable()
export class InteractiveSessionService implements OnDestroy {
  readonly executionParameters = signal<Record<string, any> | undefined>(undefined);
  readonly hasExecutionParameters = computed(() => !!this.executionParameters());

  private lastRepositoryObject?: RepositoryObjectReference;
  private interactiveSessionId$ = new BehaviorSubject<string | undefined>(undefined);

  readonly isActive$ = this.interactiveSessionId$.pipe(map((value) => !!value));

  readonly keywordParameters$: Observable<KeywordParameters> = this.interactiveSessionId$.pipe(
    map((eid) => ({ eid, type: TYPE_LEAF_REPORT_NODES_TABLE_PARAMS })),
  );

  private _screenTemplates = inject(AugmentedScreenService);
  private _interactiveApi = inject(AugmentedInteractivePlanExecutionService);
  private _planEditorApi = inject(PlanContextApiService);

  init(): void {
    this._screenTemplates
      .getDefaultParametersByScreenId('executionParameters')
      .subscribe((data) => this.executionParameters.set(data));
  }

  isInteractiveSessionActive(): boolean {
    return !!this.interactiveSessionId$.value;
  }

  startInteractive(repositoryObject: RepositoryObjectReference): Observable<string> {
    const sessionId = this.interactiveSessionId$.value;
    if (sessionId) {
      return of(sessionId);
    }

    this.lastRepositoryObject = repositoryObject;

    const executionParameters: ExecutionParameters = {
      repositoryObject,
      userID: '',
      mode: 'RUN',
      customParameters: untracked(() => this.executionParameters()),
    };

    return this._screenTemplates
      .filterInactiveParameters('executionParameters', executionParameters.customParameters)
      .pipe(
        switchMap((customParameters) =>
          this._interactiveApi.startInteractiveSession({ ...executionParameters, customParameters }),
        ),
        tap((sessionId) => this.interactiveSessionId$.next(sessionId)),
      );
  }

  stopInteractive(): Observable<unknown> {
    const sessionId = this.interactiveSessionId$.value;
    if (!sessionId) {
      return of(undefined);
    }
    return this._interactiveApi
      .stopInteractiveSession(sessionId)
      .pipe(tap(() => this.interactiveSessionId$.next(undefined)));
  }

  resetInteractive(): Observable<string> {
    return this.stopInteractive().pipe(switchMap(() => this.startInteractive(this.lastRepositoryObject!)));
  }

  execute(planId: string, selectedArtefactsIds: string[]): Observable<unknown> {
    const sessionId = this.interactiveSessionId$.value;
    if (!sessionId || selectedArtefactsIds.length === 0) {
      return of(undefined);
    }

    const [artefactId, ...restArtefacts] = selectedArtefactsIds;
    return this._planEditorApi
      .executeArtefact(sessionId, planId, artefactId)
      .pipe(switchMap(() => this.execute(planId, restArtefacts)));
  }

  ngOnDestroy(): void {
    const sessionId = this.interactiveSessionId$.value;
    if (sessionId) {
      this.stopInteractive().subscribe();
    }
    this.interactiveSessionId$.complete();
  }
}
