import { Injectable } from '@angular/core';
import { LoginStrategy } from '../shared/login-strategy';
import { Observable, throwError } from 'rxjs';

const DEFAULT_LOGIN_STRATEGY: LoginStrategy = {
  login: (username: string, password: string) => throwError(() => new Error('not supported')),
  logout: () => throwError(() => new Error('not supported')),
};

@Injectable({
  providedIn: 'root',
})
export class LoginService implements LoginStrategy {
  private strategy = DEFAULT_LOGIN_STRATEGY;

  useStrategy(strategy: LoginStrategy): void {
    this.strategy = strategy;
  }

  login(username: string, password: string): Observable<any> {
    return this.strategy.login(username, password);
  }

  logout(): Observable<any> {
    return this.strategy.logout();
  }
}
