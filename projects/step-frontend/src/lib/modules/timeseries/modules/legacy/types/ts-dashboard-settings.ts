import { Execution, TimeRange } from '@exense/step-core';
import { TimeRangePickerSelection, FilterBarItem } from '../../_common';

export interface TimeSeriesDashboardSettings {
  contextId: string; // this must be unique across the application
  contextualFilters: Partial<Record<string, string>>;
  showContextualFilters: boolean; // show in filter bar
  includeThreadGroupChart?: boolean;
  disableThreadGroupOnOqlMode?: boolean;
  timeRange: TimeRange;
  timeRangeOptions: TimeRangePickerSelection[];
  activeTimeRange: TimeRangePickerSelection;
  filterOptions: FilterBarItem[];
  activeFilters?: FilterBarItem[];
  grouping?: string[];
  execution?: Execution;
}
