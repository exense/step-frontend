import { RelativeTimeSelection } from './relative-time-selection';

export interface TimeSelection {
  isRelativeSelection: boolean;
  relativeSelection?: RelativeTimeSelection;
  absoluteSelection?: { from?: number; to?: number };
}
