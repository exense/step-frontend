import { inject, Injectable } from '@angular/core';
import { CredentialsStrategy } from '../types/credentials-strategy';
import { Observable, tap, throwError } from 'rxjs';
import { LOGOUT_CLEANUP } from './logout-cleanup.token';

const DEFAULT_CREDENTIALS_STRATEGY: CredentialsStrategy = {
  login: (username: string, password: string) => throwError(() => new Error('not supported')),
  logout: () => throwError(() => new Error('not supported')),
  changePassword: (isCurrentPasswordOneTime?: boolean) => throwError(() => new Error('not supported')),
};

@Injectable({
  providedIn: 'root',
})
export class CredentialsService implements CredentialsStrategy {
  private logoutCleanup = inject(LOGOUT_CLEANUP, { optional: true }) ?? [];

  private strategy = DEFAULT_CREDENTIALS_STRATEGY;

  useStrategy(strategy: CredentialsStrategy): void {
    this.strategy = strategy;
  }

  login(username: string, password: string): Observable<any> {
    return this.strategy.login(username, password);
  }

  logout(): Observable<any> {
    return this.strategy.logout().pipe(tap(() => this.invokeLogoutCleanup()));
  }

  changePassword(isCurrentPasswordOneTime?: boolean): Observable<any> {
    return this.strategy.changePassword(isCurrentPasswordOneTime);
  }

  private invokeLogoutCleanup(): void {
    // this currently only works for non-plugin components
    this.logoutCleanup.forEach((item) => item.logoutCleanup());

    // reload and remove tenant from url
    window.location.replace(location.pathname);
  }
}
