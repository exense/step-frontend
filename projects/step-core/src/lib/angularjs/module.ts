import { getAngularJSGlobal } from '@angular/upgrade/static';
import { TOOLTIP_DIRECTIVE, TooltipDirective } from './directives/tooltip.directive';
import { STEP_ICON_DIRECTIVE, STEP_ICON_DIRECTIVE_NAME } from './directives/step-icon.directive';
import {
  ARTEFACT_DETAILS_WRAPPER,
  ArtefactDetailsWrapperDirective,
} from './directives/artefact-details-wrapper.directive';
import {
  SIMPLE_LINE_CHART_WRAPPER_DIRECTIVE,
  SimpleLineChartWrapper,
} from './directives/simple-line-chart-wrapper.directive';

export const STEP_CORE_JS = 'stepCoreJS';

getAngularJSGlobal()
  .module(STEP_CORE_JS, ['ui.bootstrap', 'ui.bootstrap.tooltip'])
  .directive(TOOLTIP_DIRECTIVE, [() => TooltipDirective])
  .directive(STEP_ICON_DIRECTIVE_NAME, STEP_ICON_DIRECTIVE)
  .directive(ARTEFACT_DETAILS_WRAPPER, [() => ArtefactDetailsWrapperDirective])
  .directive(SIMPLE_LINE_CHART_WRAPPER_DIRECTIVE, [() => SimpleLineChartWrapper]);
