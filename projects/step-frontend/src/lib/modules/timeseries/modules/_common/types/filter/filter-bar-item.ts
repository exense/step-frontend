import { EntitySearchValue } from './entity-search-value';

/**
 * Frontend entity for mapping a filter item. This entity stores more elements than the backend item.
 */
export interface FilterBarItem {
  label?: string;
  attributeName: string;
  type: FilterBarItemType;
  isHidden?: boolean;
  isLocked?: boolean; // the attributeName can't be modified
  removable?: boolean;
  menuOpenOnInit?: boolean;

  min?: number; // for numbers an dates
  max?: number; // for numbers an dates
  freeTextValues?: string[]; // for free text, using regex search
  textValues?: { value: string; isSelected?: boolean }[]; // for text with suggestions, using exact match
  exactMatch?: boolean;

  metadata?: any; // for special fields
  searchEntities: EntitySearchValue[]; // when dealing with special search objects la executions, tasks, plans
  updateTimeSelectionOnFilterChange?: boolean;
}

export enum FilterBarItemType {
  OPTIONS = 'OPTIONS', // TODO merge with FREE_TEXT and change filter-bar-item component
  FREE_TEXT = 'FREE_TEXT',
  EXECUTION = 'EXECUTION',
  TASK = 'TASK',
  PLAN = 'PLAN',
  NUMERIC = 'NUMERIC',
  DATE = 'DATE',
}
