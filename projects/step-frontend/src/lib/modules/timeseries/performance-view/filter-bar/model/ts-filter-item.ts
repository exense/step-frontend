import { EntitySearchValue } from '../item/entity-search-value';

export interface TsFilterItem {
  label?: string;
  attributeName: string;
  type: FilterBarItemType;
  isHidden?: boolean;
  isLocked?: boolean; // the attributeName can't be modified
  removable?: boolean;

  min?: number; // for numbers an dates
  max?: number; // for numbers an dates
  freeTextValues?: string[]; // for free text, using regex search
  textValues?: { value: string; isSelected?: boolean }[]; // for text with suggestions, using exact match
  exactMatch?: boolean;

  metadata?: any; // for special fields
  searchEntities: EntitySearchValue[]; // when dealing with special search objects la executions, tasks, plans
  updateTimeSelectionOnFilterChange?: boolean;
}

export type FilterBarItemType = 'OPTIONS' | 'FREE_TEXT' | 'EXECUTION' | 'TASK' | 'PLAN' | 'NUMERIC' | 'DATE';
