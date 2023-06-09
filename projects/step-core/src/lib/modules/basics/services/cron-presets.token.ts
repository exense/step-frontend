import { InjectionToken } from '@angular/core';
import { KeyValue } from '@angular/common';

export const CRON_PRESETS = new InjectionToken<KeyValue<string, string>[]>('Cron presents', {
  providedIn: 'root',
  factory: () => [
    { key: '0 0/1 * * * ?', value: 'Every minute' },
    { key: '0 0/5 * * * ?', value: 'Every 5 minutes' },
    { key: '0 0 0/1 * * ?', value: 'Every hour' },
    { key: '0 0 0/2 * * ?', value: 'Every 2 hours' },
    { key: '0 0 7 * * ?', value: 'Every day at 07:00' },
  ],
});
