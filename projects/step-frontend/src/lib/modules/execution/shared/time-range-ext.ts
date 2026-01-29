import { TimeRange } from '@exense/step-core';

export interface TimeRangeExt extends TimeRange {
  isManualChange?: boolean;
}
