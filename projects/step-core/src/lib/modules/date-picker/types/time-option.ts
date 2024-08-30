import { DateRange } from './date-range';

export interface TimeOptionRelativeValue {
  isRelative: true;
  msFromNow: number;
}

export interface TimeOption {
  label: string;
  value: TimeOptionRelativeValue | DateRange;
}
