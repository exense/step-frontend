import { InjectionToken } from '@angular/core';

export const VIEW_ID_LINK_PREFIX = new InjectionToken<string>('View ID link prefix', {
  providedIn: 'root',
  factory: () => 'link:',
});
