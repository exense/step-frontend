import { InjectionToken } from '@angular/core';
import { TimeOption } from '../types/time-option';
import { TimeUnit } from '../../basics/types/time-unit.enum';

const timeOption = (msFromNow: number, label: string): TimeOption => ({
  label,
  value: {
    isRelative: true,
    msFromNow,
  },
});

export const DEFAULT_RELATIVE_TIME_OPTIONS = new InjectionToken('Default relative time options', {
  providedIn: 'root',
  factory: () => [
    timeOption(TimeUnit.MINUTE, 'Last 1 minute'),
    timeOption(TimeUnit.MINUTE * 5, 'Last 5 minutes'),
    timeOption(TimeUnit.MINUTE * 15, 'Last 15 minutes'),
    timeOption(TimeUnit.MINUTE * 30, 'Last 30 minutes'),
    timeOption(TimeUnit.HOUR, 'Last 1 hour'),
    timeOption(TimeUnit.HOUR * 3, 'Last 3 hours'),
  ],
});
