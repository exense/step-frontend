import { InjectionToken } from '@angular/core';

/**
 * Tooltip of the button that switches a field from a plain value to an expression.
 * Applications can provide a different text to override the default.
 */
export const DYNAMIC_EXPRESSION_TOGGLE_TOOLTIP = new InjectionToken<string>('DYNAMIC_EXPRESSION_TOGGLE_TOOLTIP', {
  providedIn: 'root',
  factory: () => 'Toggle to use an expression for this value',
});
