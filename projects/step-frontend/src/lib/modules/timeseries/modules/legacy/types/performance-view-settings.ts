import { TimeRange } from '@exense/step-core';

export interface PerformanceViewSettings {
  contextId: string; // this must be unique across the application
  contextualFilters: Partial<Record<string, string>>;
  timeRange: TimeRange;
  includeThreadGroupChart?: boolean;
  disableThreadGroupOnOqlMode?: boolean;
  displayTooltipLinks?: boolean;
}
