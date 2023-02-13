import { TSTimeRange } from '../../chart/model/ts-time-range';
import { TsFilterItem } from '../../performance-view/filter-bar/model/ts-filter-item';

export interface TimeSeriesDashboardSettings {
  contextId: string; // this must be unique across the application
  contextualFilters: { [key: string]: string };
  showContextualFilters: boolean; // show in filter bar
  includeThreadGroupChart?: boolean;
  timeRange: TSTimeRange;
  filterOptions: TsFilterItem[];
  activeFilters?: TsFilterItem[];
}
