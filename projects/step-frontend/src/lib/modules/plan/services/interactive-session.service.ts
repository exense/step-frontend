import { Injectable, OnDestroy } from '@angular/core';
import {
  AugmentedInteractivePlanExecutionService,
  AugmentedScreenService,
  ExecutionParameters,
  RepositoryObjectReference,
} from '@exense/step-core';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { KeywordParameters, TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../execution/execution.module';

@Injectable()
export class InteractiveSessionService implements OnDestroy {
  executionParameters?: Record<string, any>;

  private lastRepositoryObject?: RepositoryObjectReference;
  private interactiveSessionId$ = new BehaviorSubject<string | undefined>(undefined);

  readonly isActive$ = this.interactiveSessionId$.pipe(map((value) => !!value));

  readonly keywordParameters$: Observable<KeywordParameters> = this.interactiveSessionId$.pipe(
    map((eid) => ({ eid, type: TYPE_LEAF_REPORT_NODES_TABLE_PARAMS }))
  );

  constructor(
    private _screenTemplates: AugmentedScreenService,
    private _interactiveApi: AugmentedInteractivePlanExecutionService
  ) {}

  init(): void {
    this._screenTemplates
      .getScreenInputsByScreenId('executionParameters')
      .pipe(
        map((inputs) =>
          inputs
            .map((x) => x.input)
            .filter((x) => !!x)
            .reduce((res, input) => {
              const defaultValue = input?.defaultValue;
              const options = input?.options;

              let value = '';

              if (defaultValue) {
                value = defaultValue;
              } else if (!!options?.length) {
                value = options[0].value!;
              }

              res[input!.id!] = value;
              return res;
            }, {} as Record<string, any>)
        )
      )
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
    return this._interactiveApi
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
