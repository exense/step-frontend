import { inject, InjectionToken, DOCUMENT } from '@angular/core';
import { debounceTime, map, Observable, shareReplay, startWith } from 'rxjs';

import { resizeObservable } from './resize-observable';

export const SCREEN_WIDTH = new InjectionToken<Observable<number>>('Screen width observable token', {
  providedIn: 'root',
  factory: () => {
    const _document = inject(DOCUMENT);
    return resizeObservable(_document.body).pipe(
      debounceTime(300),
      map(([bodyEntry]) => bodyEntry.contentRect.width),
      startWith(_document.body.getBoundingClientRect().width),
      shareReplay(1),
    );
  },
});
