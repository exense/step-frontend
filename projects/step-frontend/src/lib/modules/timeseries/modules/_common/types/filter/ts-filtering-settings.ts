import { TsFilteringMode } from './ts-filtering-mode.enum';
import { FilterBarItem } from './filter-bar-item';

export interface TsFilteringSettings {
  mode: TsFilteringMode;
  oql: string; // for oql mode
  filterItems: FilterBarItem[]; // custom filters
}
