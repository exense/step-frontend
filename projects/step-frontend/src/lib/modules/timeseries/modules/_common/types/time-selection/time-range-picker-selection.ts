import { RelativeTimeSelection } from './relative-time-selection';
import { TimeRange } from '@exense/step-core';

export interface TimeRangePickerSelection {
  type: 'FULL' | 'ABSOLUTE' | 'RELATIVE';
  absoluteSelection?: TimeRange;
  relativeSelection?: RelativeTimeSelection;
}

export enum TimeRangeType {
  FULL = 'FULL',
  ABSOLUTE = 'ABSOLUTE',
  RELATIVE = 'RELATIVE',
}
