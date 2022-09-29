import { getAngularJSGlobal } from '@angular/upgrade/static';
import { TOOLTIP_DIRECTIVE, TooltipDirective } from './directives/tooltip.directive';
import { STEP_ICON_DIRECTIVE, STEP_ICON_DIRECTIVE_NAME } from './directives/step-icon.directive';

export const STEP_CORE_JS = 'stepCoreJS';

getAngularJSGlobal()
  .module(STEP_CORE_JS, ['ui.bootstrap', 'ui.bootstrap.tooltip'])
  .directive(TOOLTIP_DIRECTIVE, [() => TooltipDirective])
  .directive(STEP_ICON_DIRECTIVE_NAME, STEP_ICON_DIRECTIVE);
