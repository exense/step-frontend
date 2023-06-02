import { inject, Injectable } from '@angular/core';
import { LoginStrategy } from '../shared/login-strategy';
import { Observable, tap, throwError } from 'rxjs';
import { LOGOUT_CLEANUP } from '../shared/logout-cleanup.token';

const DEFAULT_LOGIN_STRATEGY: LoginStrategy = {
  login: (username: string, password: string) => throwError(() => new Error('not supported')),
  logout: () => throwError(() => new Error('not supported')),
};

@Injectable({
  providedIn: 'root',
})
export class LoginService implements LoginStrategy {
  private logoutCleanup = inject(LOGOUT_CLEANUP, { optional: true }) ?? [];

  private strategy = DEFAULT_LOGIN_STRATEGY;

  useStrategy(strategy: LoginStrategy): void {
    this.strategy = strategy;
  }

  login(username: string, password: string): Observable<any> {
    return this.strategy.login(username, password);
  }

  logout(): Observable<any> {
    return this.strategy.logout().pipe(tap(() => this.invokeLogoutCleanup()));
  }

  private invokeLogoutCleanup(): void {
    this.logoutCleanup.forEach((item) => item.logoutCleanup());
  }
}
