import { Injectable } from '@angular/core';
import { Parameter } from '@exense/step-core';
import { ParameterScope } from '../types/parameter-scope.type';

@Injectable({
  providedIn: 'root',
})
export class ParameterScopeRendererService {
  constructor() {}

  // Backward compatibility: assuming GLOBAL scope if not set
  normalizeScope(scope?: ParameterScope): ParameterScope {
    return scope || 'GLOBAL';
  }

  scopeIcon(scope?: ParameterScope): string | undefined {
    const normalizedScope = this.normalizeScope(scope);

    switch (normalizedScope) {
      case 'GLOBAL':
        return 'square';
      case 'FUNCTION':
        return 'target';
      case 'APPLICATION':
        return 'terminal';
    }
  }

  scopeCssClass(scope?: ParameterScope): string | undefined {
    const normalizedScope = this.normalizeScope(scope);

    switch (normalizedScope) {
      case 'GLOBAL':
        return 'parameter-scope-global';
      case 'FUNCTION':
        return 'parameter-scope-keyword';
      case 'APPLICATION':
        return 'parameter-scope-application';
    }
  }

  scopeSpanCssClass(scope?: ParameterScope): string {
    const normalizedScope = this.normalizeScope(scope);

    return 'parameter-scope ' + this.scopeCssClass(normalizedScope);
  }

  label(parameter?: Parameter): string | undefined {
    if (!parameter) {
      return;
    }

    const normalizedScope = this.normalizeScope(parameter.scope);

    if (normalizedScope === 'GLOBAL') {
      return 'Global';
    } else {
      return parameter.scopeEntity;
    }
  }

  scopeLabel(scope?: ParameterScope): string | undefined {
    const normalizedScope = this.normalizeScope(scope);

    switch (normalizedScope) {
      case 'GLOBAL':
        return 'Global';
      case 'FUNCTION':
        return 'Keyword';
      case 'APPLICATION':
        return 'Application';
    }
  }
}
