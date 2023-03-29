import { InjectionToken } from '@angular/core';

export const STORAGE = new InjectionToken<Storage>('storage', {
  providedIn: 'root',
  factory: () => localStorage,
});
