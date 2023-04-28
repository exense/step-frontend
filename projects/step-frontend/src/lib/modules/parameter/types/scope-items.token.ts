import { ParameterScope } from './parameter-scope.type';
import { inject, InjectionToken } from '@angular/core';
import { ParameterScopeRendererService } from '../services/parameter-scope-renderer.service';

export interface ScopeItem {
  scope: ParameterScope;
  icon: string;
  cssClass: string;
  spanCssClass: string;
  label: string;
}

export const SCOPE_ITEMS = new InjectionToken<ScopeItem[]>('Scope items', {
  providedIn: 'root',
  factory: () => {
    const parameterScopeRendered = inject(ParameterScopeRendererService);
    const scopes: ParameterScope[] = ['GLOBAL', 'APPLICATION', 'FUNCTION'];
    return scopes.map(
      (scope) =>
        ({
          scope,
          icon: parameterScopeRendered.scopeIcon(scope),
          cssClass: parameterScopeRendered.scopeCssClass(scope),
          spanCssClass: parameterScopeRendered.scopeSpanCssClass(scope),
          label: parameterScopeRendered.scopeLabel(scope),
        } as ScopeItem)
    );
  },
});
