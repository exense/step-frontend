import { getAngularJSGlobal } from '@angular/upgrade/static';
import { TOOLTIP_DIRECTIVE, TooltipDirective } from './directives/tooltip.directive';

export const STEP_CORE_JS = 'stepCoreJS';

getAngularJSGlobal()
  .module(STEP_CORE_JS, ['ui.bootstrap', 'ui.bootstrap.tooltip'])
  .directive(TOOLTIP_DIRECTIVE, [() => TooltipDirective]);
