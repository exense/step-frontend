import { TsFilteringMode } from './ts-filtering-mode.enum';
import { FilterBarItem } from './filter-bar-item';

export interface TsFilteringSettings {
  mode: TsFilteringMode;
  filterItems: FilterBarItem[]; // custom filters
  oql?: string; // for oql mode
}
