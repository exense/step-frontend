import { TimeRange, type TimeRangeRelativeSelection, TimeRangeSelection } from '@exense/step-core';
import { TimeRangePickerSelection } from '../../modules/_common/types/time-selection/time-range-picker-selection';

/**
 * This entity will store all the settings for a dashboard regarding time selection.
 */
export interface DashboardTimeRangeSettings {
  timeRangeSelection?: TimeRangePickerSelection; // used only in compare mode
  fullRange: TimeRange;
  selectedRange: TimeRange;
}
