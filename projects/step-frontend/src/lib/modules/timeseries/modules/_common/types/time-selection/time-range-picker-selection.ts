import { TimeRange } from '@exense/step-core';
import { TimeRangeRelativeSelection } from '@exense/step-core';

export interface TimeRangePickerSelection {
  type: 'FULL' | 'ABSOLUTE' | 'RELATIVE';
  absoluteSelection?: TimeRange;
  relativeSelection?: TimeRangeRelativeSelection;
}

export enum TimeRangeType {
  FULL = 'FULL',
  ABSOLUTE = 'ABSOLUTE',
  RELATIVE = 'RELATIVE',
}
