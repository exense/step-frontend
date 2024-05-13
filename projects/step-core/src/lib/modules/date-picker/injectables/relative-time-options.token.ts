import { InjectionToken } from '@angular/core';
import { KeyValue } from '@angular/common';
import { TimeUnit } from '../../basics/step-basics.module';

export const RELATIVE_TIME_OPTIONS = new InjectionToken('Relative time options', {
  providedIn: 'root',
  factory: () =>
    [
      { key: TimeUnit.MINUTE, value: 'Last 1 minute' },
      { key: TimeUnit.MINUTE * 5, value: 'Last 5 minutes' },
      { key: TimeUnit.MINUTE * 15, value: 'Last 15 minutes' },
      { key: TimeUnit.MINUTE * 30, value: 'Last 30 minutes' },
      { key: TimeUnit.HOUR, value: 'Last 1 hour' },
      { key: TimeUnit.HOUR * 3, value: 'Last 3 hours' },
    ] as KeyValue<number, string>[],
});
