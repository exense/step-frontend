import { TimeRange } from '@exense/step-core';
import { TimeRangeRelativeSelection } from '@exense/step-core';

export interface ExecutionTimeSelection {
  type: 'ABSOLUTE' | 'FULL' | 'RELATIVE';
  relativeSelection?: TimeRangeRelativeSelection; // last X minutes
  absoluteSelection?: TimeRange; // the translation in concrete time values
}
