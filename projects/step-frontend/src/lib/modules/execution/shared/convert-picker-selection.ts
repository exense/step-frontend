import { TimeRangePickerSelection } from '../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { Execution, TimeRange } from '@exense/step-core';

export const convertPickerSelectionToTimeRange = (
  pickerSelection: TimeRangePickerSelection,
  execution: Execution,
  currentExecutionId?: string,
): TimeRange | undefined => {
  if (!!currentExecutionId && execution.id !== currentExecutionId) {
    // when the execution changes, the activeExecution is triggered and the time-range will be updated and retrigger this
    return undefined;
  }
  switch (pickerSelection.type) {
    case 'FULL':
      const now = new Date().getTime();
      return { from: execution.startTime!, to: execution.endTime || Math.max(now, execution.startTime! + 5000) };
    case 'ABSOLUTE':
      return pickerSelection.absoluteSelection!;
    case 'RELATIVE':
      const endTime = execution.endTime || new Date().getTime();
      return { from: endTime - pickerSelection.relativeSelection!.timeInMs, to: endTime };
  }
};
