export interface TsFilterItem {
  label: string;
  attributeName: string;
  type: FilterBarItemType;

  min?: string; // for numbers an dates
  max?: string; // for numbers an dates
  textValue?: string; // for free text
  textValues?: { value: string; isSelected?: boolean }[]; // for text with suggestions
}

export enum FilterBarItemType {
  TEXT = 'TEXT', // this is a text with suggestions
  FREE_TEXT = 'FREE_TEXT', // used for custom attributes we don't know the values
  NUMERIC = 'NUMERIC',
  DATE = 'DATE',
}
