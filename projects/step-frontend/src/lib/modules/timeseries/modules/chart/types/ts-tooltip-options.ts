import { TooltipContextData } from '../injectables/tooltip-context-data';

export interface TsTooltipOptions {
  enabled: boolean;
  /**
   * If evaluates to true, tooltip will be displayed, no matter the hovered data. This is useful for setting complex functions which can't be declared in the template.
   * @param context
   */
  displayCondition?: (context: TooltipContextData) => boolean;
  useExecutionLinks?: boolean;
  yAxisUnit?: string;
  zAxisUnit?: string;
  zAxisLabel?: string;
}
