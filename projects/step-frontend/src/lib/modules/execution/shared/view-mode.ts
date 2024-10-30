import { InjectionToken } from '@angular/core';

export enum ViewMode {
  VIEW = 'view',
  PRINT = 'print',
}

export const VIEW_MODE = new InjectionToken<ViewMode>('ViewMode');
