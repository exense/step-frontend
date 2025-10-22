import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { AdditionalRightRule } from '../types/additional-right-rule';

@Injectable({
  providedIn: 'root',
})
export class AdditionalRightRuleService {
  private _rules: AdditionalRightRule[] = [];
  private _rootInjector = inject(Injector);

  registerRule(...rules: AdditionalRightRule[]): void {
    this._rules.push(...rules);
  }

  checkRight(right: string, injector?: Injector): boolean {
    if (this._rules.length === 0) {
      return true;
    }

    return this._rules.reduce(
      (res: boolean, rule: AdditionalRightRule) => res && this.checkRule(rule, right, injector),
      true,
    );
  }

  private checkRule(rule: AdditionalRightRule, right: string, injector?: Injector): boolean {
    injector = injector ?? this._rootInjector;
    return runInInjectionContext(injector, () => rule(right));
  }
}
