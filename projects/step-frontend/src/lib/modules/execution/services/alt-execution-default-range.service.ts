import { DateRange, Execution } from '@exense/step-core';

export abstract class AltExecutionDefaultRangeService {
  abstract getDefaultRangeForExecution(execution: Execution): DateRange;
}
