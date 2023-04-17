import { inject, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export const IS_TOUCH_DEVICE = new InjectionToken<boolean>('Returns true in case of touch device', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    return (
      'ontouchstart' in (document?.defaultView || {}) ||
      !!(document?.defaultView?.navigator as any)?.['msMaxTouchPoints']
    );
  },
});
