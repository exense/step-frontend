import { Injectable } from '@angular/core';
import { AdditionalRightRule } from '../types/additional-right-rule';

@Injectable({
  providedIn: 'root',
})
export class AdditionalRightRuleService {
  private _rules: AdditionalRightRule[] = [];

  registerRule(...rules: AdditionalRightRule[]): void {
    this._rules.push(...rules);
  }

  checkRight(right: string): boolean {
    if (this._rules.length === 0) {
      return true;
    }

    return this._rules.reduce((res: boolean, rule: AdditionalRightRule) => res && rule(right), true);
  }
}
