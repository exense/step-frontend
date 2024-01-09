/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TimeRange } from './TimeRange';
import type { TimeRangeRelativeSelection } from './TimeRangeRelativeSelection';

export type TimeRangeSelection = {
  type: 'FULL' | 'ABSOLUTE' | 'RELATIVE';
  absoluteSelection?: TimeRange;
  relativeSelection?: TimeRangeRelativeSelection;
};
