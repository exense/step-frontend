import {inject, InjectionToken} from '@angular/core';
import {DOCUMENT} from '@angular/common';

export const STEP_IDE_MODE = Symbol('STEP_IDE_MODE');

export const IDE_MODE = new InjectionToken<boolean>('IDE mode', {
  providedIn: 'root',
  factory: () => {
    const _doc = inject(DOCUMENT);
    return !!((_doc?.defaultView as any)?.[STEP_IDE_MODE])
  }
});