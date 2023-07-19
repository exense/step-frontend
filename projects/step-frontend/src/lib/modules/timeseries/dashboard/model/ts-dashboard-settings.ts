import { TSTimeRange } from '../../chart/model/ts-time-range';
import { TsFilterItem } from '../../performance-view/filter-bar/model/ts-filter-item';
import { TimeRangePickerSelection } from '../../time-selection/time-range-picker-selection';
import { Execution } from '@exense/step-core';

export interface TimeSeriesDashboardSettings {
  contextId: string; // this must be unique across the application
  contextualFilters: Record<string, string>;
  showContextualFilters: boolean; // show in filter bar
  includeThreadGroupChart?: boolean;
  disableThreadGroupOnOqlMode?: boolean;
  timeRange: TSTimeRange;
  timeRangeOptions: TimeRangePickerSelection[];
  activeTimeRange: TimeRangePickerSelection;
  filterOptions: TsFilterItem[];
  activeFilters?: TsFilterItem[];

  execution?: Execution;
}
