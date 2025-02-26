import { TimeRangeSelection } from '@exense/step-core';

export interface TimeRangePickerSelection extends TimeRangeSelection {}

export enum TimeRangeType {
  FULL = 'FULL',
  ABSOLUTE = 'ABSOLUTE',
  RELATIVE = 'RELATIVE',
}
