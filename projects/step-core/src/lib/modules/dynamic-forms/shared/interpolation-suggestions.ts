import { InjectionToken, Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface InterpolationSuggestionContext {
  planId: string;
  nodeId: string;
}

export interface InterpolationSuggestionRequest extends InterpolationSuggestionContext {
  field: string;
}

export interface InterpolationSuggestion {
  expression: string;
  returnType: string;
}

export abstract class InterpolationSuggestionLookup {
  abstract lookup(request: InterpolationSuggestionRequest): Observable<readonly InterpolationSuggestion[]>;
}

export const INTERPOLATION_SUGGESTION_CONTEXT = new InjectionToken<Signal<InterpolationSuggestionContext | undefined>>(
  'Interpolation suggestion context',
);
