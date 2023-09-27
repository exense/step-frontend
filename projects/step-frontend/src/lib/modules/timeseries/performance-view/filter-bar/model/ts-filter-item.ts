import { EntitySearchValue } from '../item/entity-search-value';

export interface TsFilterItem {
  label: string;
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

export enum FilterBarItemType {
  OPTIONS = 'OPTIONS', // this is a text with suggestions
  FREE_TEXT = 'FREE_TEXT', // used for custom attributes we don't know the values
  EXECUTION = 'EXECUTION', // custom behavior with picker for executions
  TASK = 'TASK', // custom behavior with picker for tasks
  PLAN = 'PLAN', // custom behavior with picker for plans
  NUMERIC = 'NUMERIC',
  DATE = 'DATE',
}
