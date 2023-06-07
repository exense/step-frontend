import { InjectionToken } from '@angular/core';

export abstract class LogoutCleanup {
  abstract logoutCleanup(): void;
}

export const LOGOUT_CLEANUP = new InjectionToken<LogoutCleanup[]>('Logout Cleanup hooks');
