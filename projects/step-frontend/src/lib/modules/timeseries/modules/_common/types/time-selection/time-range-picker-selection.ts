import { TimeRange, TimeRangeSelection } from '@exense/step-core';

export interface TimeRangePickerSelection extends TimeRangeSelection {
  // type: 'FULL' | 'ABSOLUTE' | 'RELATIVE';
  // absoluteSelection?: TimeRange;
  // relativeSelection?: RelativeTimeSelection;
}

export enum TimeRangeType {
  FULL = 'FULL',
  ABSOLUTE = 'ABSOLUTE',
  RELATIVE = 'RELATIVE',
}
