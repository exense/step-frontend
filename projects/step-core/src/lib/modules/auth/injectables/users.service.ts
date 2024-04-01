import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../../../client/step-client-module';

export interface UsersStrategy {
  getUserById(userId: string): Observable<User | undefined>;
}

const DEFAULT_USER_STRATEGY: UsersStrategy = {
  getUserById(userId: string): Observable<User | undefined> {
    return of(undefined);
  },
};

@Injectable({
  providedIn: 'root',
})
export class UsersService implements UsersStrategy {
  private strategy: UsersStrategy = DEFAULT_USER_STRATEGY;

  getUserById(userId: string): Observable<User | undefined> {
    return this.strategy.getUserById(userId);
  }

  useStrategy(strategy: UsersStrategy): void {
    this.strategy = strategy;
  }
}
