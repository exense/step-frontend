import { InjectionToken, TrackByFunction } from '@angular/core';
import { KeyValue } from '@angular/common';
import { MONTHS_DICTIONARY } from '../types/months';

export type RangeItem = KeyValue<number | string, string>;

export const trackByRange: TrackByFunction<RangeItem> = (_, item) => item.key;

const createRange = (stop: number, start: number = 0, step: number = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);

const createDayLabel = (day: number) => {
  const dayStr = day.toString();
  let suffix: string;
  switch (dayStr[dayStr.length - 1]) {
    case '1':
      suffix = 'st';
      break;
    case '2':
      suffix = 'nd';
      break;
    case '3':
      suffix = 'rd';
      break;
    default:
      suffix = 'th';
      break;
  }
  return `${dayStr}${suffix} Day`;
};

export const RANGE_SECONDS = new InjectionToken<RangeItem[]>('Seconds range', {
  providedIn: 'root',
  factory: () => createRange(59).map((key) => ({ key, value: key.toString().padStart(2, '0') })),
});

export const RANGE_MINUTES = new InjectionToken<RangeItem[]>('Minutes range', {
  providedIn: 'root',
  factory: () => createRange(59, 1).map((key) => ({ key, value: key.toString().padStart(2, '0') })),
});

export const RANGE_HOURS = new InjectionToken<RangeItem[]>('Hours range', {
  providedIn: 'root',
  factory: () => createRange(23, 1).map((key) => ({ key, value: key.toString().padStart(2, '0') })),
});

export const RANGE_DAYS = new InjectionToken<RangeItem[]>('Days range', {
  providedIn: 'root',
  factory: () => createRange(31, 1).map((key) => ({ key, value: key.toString().padStart(2, '0') })),
});

export const RANGE_MONTHS_NUMBERS = new InjectionToken<RangeItem[]>('Months numbers range', {
  providedIn: 'root',
  factory: () => createRange(12, 1).map((key) => ({ key, value: key.toString().padStart(2, '0') })),
});

export const RANGE_MONTHS_NAMES = new InjectionToken<RangeItem[]>('Months names range', {
  providedIn: 'root',
  factory: () => createRange(12, 1).map((key) => ({ key, value: MONTHS_DICTIONARY[key] })),
});

export const RANGE_YEARS = new InjectionToken<RangeItem[]>('Years range', {
  providedIn: 'root',
  factory: () => createRange(2100, 2020).map((key) => ({ key, value: key.toString() })),
});

export const RANGE_DAY_NUM = new InjectionToken<RangeItem[]>('Day numbers range', {
  providedIn: 'root',
  factory: () => [
    { key: '#1', value: 'First' },
    { key: '#2', value: 'Second' },
    { key: '#3', value: 'Third' },
    { key: '#4', value: 'Fourth' },
    { key: '#5', value: 'Fifth' },
    { key: 'L', value: 'Last' },
  ],
});

export const RANGE_WEEK_DAY = new InjectionToken<RangeItem[]>('Week day range', {
  providedIn: 'root',
  factory: () => [
    { key: 'MON', value: 'Monday' },
    { key: 'TUE', value: 'Tuesday' },
    { key: 'WED', value: 'Wednesday' },
    { key: 'THU', value: 'Thursday' },
    { key: 'FRI', value: 'Friday' },
    { key: 'SAT', value: 'Saturday' },
    { key: 'SUN', value: 'Sunday' },
  ],
});

export const RANGE_MONTHLY_DAYS = new InjectionToken<RangeItem[]>('Monthly days range', {
  providedIn: 'root',
  factory: () => [
    { key: '1W', value: 'First Weekday' },
    ...createRange(31, 1).map((key) => ({
      key,
      value: createDayLabel(key),
    })),
    { key: 'LW', value: 'Last Weekday' },
    { key: 'L', value: 'Last Day' },
  ],
});
