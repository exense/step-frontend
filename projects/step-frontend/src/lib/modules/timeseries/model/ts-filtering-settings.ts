import { TsFilteringMode } from './ts-filtering-mode';
import { TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';

export interface TsFilteringSettings {
  mode: TsFilteringMode;
  oql: string; // for oql mode
  filterItems: TsFilterItem[]; // custom filters
}
