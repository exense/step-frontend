/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TimeRange } from './TimeRange';

export type TimeRangeSelection = {
  type?: 'FULL' | 'ABSOLUTE' | 'RELATIVE';
  absoluteSelection?: TimeRange;
  relativeRangeMs?: number;
};
