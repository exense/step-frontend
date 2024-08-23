import { inject, InjectionToken } from '@angular/core';
import { DEFAULT_RELATIVE_TIME_OPTIONS } from './default-relative-time-options.token';
import { of } from 'rxjs';

export const RELATIVE_TIME_OPTIONS = new InjectionToken('Relative time options', {
  providedIn: 'root',
  factory: () => {
    const defaultOptions = inject(DEFAULT_RELATIVE_TIME_OPTIONS);
    return of(defaultOptions);
  },
});
