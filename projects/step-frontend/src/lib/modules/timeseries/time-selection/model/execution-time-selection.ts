import { RelativeTimeSelection } from './relative-time-selection';
import { TimeRange } from '@exense/step-core';

export interface ExecutionTimeSelection {
  type: 'ABSOLUTE' | 'FULL' | 'RELATIVE';
  relativeSelection?: RelativeTimeSelection; // last X minutes
  absoluteSelection?: TimeRange; // the translation in concrete time values
}
