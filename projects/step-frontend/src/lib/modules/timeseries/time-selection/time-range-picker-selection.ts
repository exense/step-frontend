import { RangeSelectionType } from './model/range-selection-type';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { RelativeTimeSelection } from './model/relative-time-selection';

export interface TimeRangePickerSelection {
  type: RangeSelectionType;
  absoluteSelection?: TSTimeRange;
  relativeSelection?: RelativeTimeSelection;
}
