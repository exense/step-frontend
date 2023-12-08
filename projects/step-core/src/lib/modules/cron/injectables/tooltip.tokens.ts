import { InjectionToken } from '@angular/core';

export const TOOLTIP_HOURS_RANGE = new InjectionToken<string>('Tooltip for hours range', {
  providedIn: 'root',
  factory: () => 'Excludes only the hours within given from to',
});

export const TOOLTIP_MINUTES_RANGE = new InjectionToken<string>('Tooltip for minutes range', {
  providedIn: 'root',
  factory: () => 'Excludes only the minutes within given from to',
});
