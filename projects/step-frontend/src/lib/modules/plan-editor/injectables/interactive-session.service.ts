import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  AugmentedInteractivePlanExecutionService,
  AugmentedScreenService,
  ExecutionParameters,
  RepositoryObjectReference,
} from '@exense/step-core';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { KeywordParameters, TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../execution/execution.module';
import { PlanEditorApiService } from './plan-editor-api.service';

@Injectable()
export class InteractiveSessionService implements OnDestroy {
  executionParameters?: Record<string, any>;

  private lastRepositoryObject?: RepositoryObjectReference;
  private interactiveSessionId$ = new BehaviorSubject<string | undefined>(undefined);

  readonly isActive$ = this.interactiveSessionId$.pipe(map((value) => !!value));

  readonly keywordParameters$: Observable<KeywordParameters> = this.interactiveSessionId$.pipe(
    map((eid) => ({ eid, type: TYPE_LEAF_REPORT_NODES_TABLE_PARAMS }))
  );

  private _screenTemplates = inject(AugmentedScreenService);
  private _interactiveApi = inject(AugmentedInteractivePlanExecutionService);
  private _planEditorApi = inject(PlanEditorApiService);

  init(): void {
    this._screenTemplates
      .getDefaultParametersByScreenId('executionParameters')
      .subscribe((data) => (this.executionParameters = data));
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
      customParameters: this.executionParameters,
    };

    return this._interactiveApi
      .startInteractiveSession(executionParameters)
      .pipe(tap((sessionId) => this.interactiveSessionId$.next(sessionId)));
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
