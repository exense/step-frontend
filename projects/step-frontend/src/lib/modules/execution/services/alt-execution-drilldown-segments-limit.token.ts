import { InjectionToken } from '@angular/core';

export const ALT_EXECUTION_DRILLDOWN_SEGMENTS_LIMIT = new InjectionToken(
  'How many segments in between should be kept in url',
  {
    providedIn: 'root',
    factory: () => 10,
  },
);
