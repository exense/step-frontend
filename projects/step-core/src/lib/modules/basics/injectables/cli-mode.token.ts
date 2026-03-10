import { InjectionToken } from '@angular/core';

export const CLI_MODE = new InjectionToken<boolean>('CLI mode', {
  providedIn: 'root',
  factory: () => false,
});
