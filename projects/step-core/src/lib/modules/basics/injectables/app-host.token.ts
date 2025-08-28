import { inject, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export const APP_HOST = new InjectionToken<string>('Application host', {
  providedIn: 'root',
  factory: () => {
    const _doc = inject(DOCUMENT);
    const { location } = _doc.defaultView as Window;
    return `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ''}`;
  },
});
