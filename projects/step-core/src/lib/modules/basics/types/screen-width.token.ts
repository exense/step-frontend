import { inject, InjectionToken } from '@angular/core';
import { debounceTime, map, Observable, shareReplay, startWith } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { resizeObservable } from './resize-observable';

export const SCREEN_WIDTH = new InjectionToken<Observable<number>>('Screen width observable token', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    return resizeObservable(document.body).pipe(
      debounceTime(300),
      map(([bodyEntry]) => bodyEntry.contentRect.width),
      startWith(document.body.getBoundingClientRect().width),
      shareReplay(1),
    );
  },
});
