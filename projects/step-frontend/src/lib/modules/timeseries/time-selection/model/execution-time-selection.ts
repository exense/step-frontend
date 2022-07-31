import { RelativeTimeSelection } from './relative-time-selection';
import { TSTimeRange } from '../../chart/model/ts-time-range';
import { RangeSelectionType } from './range-selection-type';

export interface ExecutionTimeSelection {
  type: RangeSelectionType;
  relativeSelection?: RelativeTimeSelection; // last X minutes
  absoluteSelection?: { from?: number; to?: number };
}
