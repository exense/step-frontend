import { TsFilteringMode } from './ts-filtering-mode';
import { FilterBarItem } from '../performance-view/filter-bar/model/filter-bar-item';

export interface TsFilteringSettings {
  mode: TsFilteringMode;
  oql: string; // for oql mode
  filterItems: FilterBarItem[]; // custom filters
}
