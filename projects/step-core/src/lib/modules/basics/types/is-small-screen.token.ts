import { inject, InjectionToken } from '@angular/core';
import { SCREEN_WIDTH } from './screen-width.token';
import { distinctUntilChanged, map, Observable } from 'rxjs';

const SMALL_SCREEN_WIDTH = 850;

export const IS_SMALL_SCREEN = new InjectionToken<Observable<boolean>>('Small screen flag', {
  providedIn: 'root',
  factory: () => {
    const screenWidth$ = inject(SCREEN_WIDTH);
    return screenWidth$.pipe(
      distinctUntilChanged(),
      map((width) => width <= SMALL_SCREEN_WIDTH),
    );
  },
});
