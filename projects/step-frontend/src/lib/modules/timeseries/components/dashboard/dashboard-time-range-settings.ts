import { TimeRange, type TimeRangeRelativeSelection, TimeRangeSelection } from '@exense/step-core';
import { RelativeTimeSelection } from '../../modules/_common';
import { TimeRangeType } from './time-range-type';

/**
 * This entity will store all the settings for a dashboard regarding time selection.
 */
export interface DashboardTimeRangeSettings {
  type: 'FULL' | 'ABSOLUTE' | 'RELATIVE';
  defaultFullRange?: Partial<TimeRange>; // used for reset (usually an execution range)
  fullRange: TimeRange; // absolute range. should be set for any situation
  selectedRange: TimeRange;
  relativeSelection?: TimeRangeRelativeSelection;
}
