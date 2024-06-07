import { TsFilteringMode } from './ts-filtering-mode.enum';
import { FilterBarItem } from './filter-bar-item';

export interface TsFilteringSettings {
  mode: TsFilteringMode;
  filterItems: FilterBarItem[]; // custom filters
  hiddenFilters?: FilterBarItem[]; // filters used always in every chart
  oql?: string; // for oql mode
}
