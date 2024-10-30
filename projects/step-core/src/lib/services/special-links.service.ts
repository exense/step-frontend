import { Injectable } from '@angular/core';
import { SpecialLinksStrategy } from '../shared/special-links-strategy';

const DEFAULT_STRATEGY: SpecialLinksStrategy = {
  settings: () => '/settings',
  userSettings: () => '/user-settings',
  adminSettings: () => '/admin/controller',
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

  userSettings(): string {
    return this.strategy.userSettings();
  }

  adminSettings(): string {
    return this.strategy.adminSettings();
  }
}
