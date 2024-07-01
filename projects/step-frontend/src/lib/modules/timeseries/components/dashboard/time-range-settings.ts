import { TimeRange } from '@exense/step-core';
import { RelativeTimeSelection } from '../../modules/_common';
import { TimeRangeType } from './time-range-type';

/**
 * This entity will store all the settings for a dashboard regarding time selection.
 */
export interface TimeRangeSettings {
  type: TimeRangeType;
  defaultFullRange?: Partial<TimeRange>; // used for reset
  fullRange: TimeRange; // absolute range for any situation
  relativeSelection?: RelativeTimeSelection;
  selectedRange: TimeRange;
}
