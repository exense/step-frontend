export interface TsFilterItem {
  label: string;
  attributeName: string;
  type: FilterBarItemType;
  isLocked?: boolean; // the attributeName can't be modified
  removable?: boolean;

  min?: number; // for numbers an dates
  max?: number; // for numbers an dates
  freeTextValues?: string[]; // for free text, using regex search
  textValues?: { value: string; isSelected?: boolean }[]; // for text with suggestions, using exact match
}

export enum FilterBarItemType {
  OPTIONS = 'OPTIONS', // this is a text with suggestions
  FREE_TEXT = 'FREE_TEXT', // used for custom attributes we don't know the values
  NUMERIC = 'NUMERIC',
  DATE = 'DATE',
}
