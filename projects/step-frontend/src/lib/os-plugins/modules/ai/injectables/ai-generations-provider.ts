import { InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AiGenerationListState, AiGenerationListStateType } from '../shared';

export interface AiGenerationsProvider {
  readonly state$: Observable<AiGenerationListState>;
}

export const AI_GENERATIONS_PROVIDER = new InjectionToken<AiGenerationsProvider>('AI generations provider', {
  providedIn: 'root',
  factory: () => ({
    state$: of({ type: AiGenerationListStateType.EMPTY }),
  }),
});
