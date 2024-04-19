import { Injectable } from '@angular/core';
import { SpecialLinksStrategy } from '../shared/special-links-strategy';

const DEFAULT_STRATEGY: SpecialLinksStrategy = {
  settings: () => '/settings',
  myAccount: () => '/settings/my-account',
};

@Injectable({
  providedIn: 'root',
})
export class SpecialLinksService implements SpecialLinksStrategy {
  private strategy: SpecialLinksStrategy = DEFAULT_STRATEGY;

  useStrategy(strategy: SpecialLinksStrategy): void {
    this.strategy = strategy;
  }

  settings(): string {
    return this.strategy.settings();
  }

  myAccount(): string {
    return this.strategy.myAccount();
  }
}
