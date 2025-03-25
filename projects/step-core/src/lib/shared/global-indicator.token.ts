import { inject, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface GlobalIndicator {
  removeIndicator(): void;
  showMessage(message: string): void;
  setFallbackMessage(fallbackMessage: string): void;
  setFallbackMessageTimeout(timeout: number): void;
}

export const GLOBAL_INDICATOR = new InjectionToken<GlobalIndicator>('Global indicator', {
  providedIn: 'root',
  factory: () => {
    const _doc = inject(DOCUMENT);
    return (_doc.defaultView as any).globalIndicator as GlobalIndicator;
  },
});
