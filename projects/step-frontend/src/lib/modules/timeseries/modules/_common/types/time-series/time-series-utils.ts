import { Execution, TimeRange } from '@exense/step-core';
import { TimeRangePickerSelection } from './../time-selection/time-range-picker-selection';

export class TimeSeriesUtils {
  static createTimeLabels(start: number, end: number, interval: number): number[] {
    const intervals = Math.ceil((end - start) / interval) + 1;
    const result = Array(intervals);
    for (let i = 0; i < intervals; i++) {
      result[i] = start + i * interval; //
    }
    // result[intervals] = result[intervals - 1] + TimeSeriesConfig.RESOLUTION; // we add one second as a small padding

    return result;
  }

  static intervalIsInside(bigInterval: TimeRange, smallInterval: TimeRange): boolean {
    return !(bigInterval.from! > smallInterval.from! || bigInterval.to! < smallInterval.to!);
  }

  /**
   * If the intervals do not overlap, this method will return undefined.
   * @param cropBounds
   * @param interval
   */
  static cropInterval(interval: TimeRange, cropBounds: TimeRange): TimeRange | undefined {
    const from = Math.max(interval.from, cropBounds.from);
    const to = Math.min(interval.to, cropBounds.to);
    const minimumIntervalSize = 3; // a bug from uPlot used to throw intervals with size 1 and 2 from time to time, even if it is empty
    if (to - from < minimumIntervalSize) {
      return undefined;
    }
    return { from: from, to: to };
  }

  static intervalsOverlap(range1: TimeRange, range2: TimeRange) {
    return range1.from! <= range2.to! && range2.from! <= range1.to!;
  }

  static intervalsEqual(range1?: TimeRange, range2?: TimeRange) {
    return range1 && range2 && range1.from! === range2.from! && range1.to! === range2.to!;
  }

  static convertExecutionAndSelectionToTimeRange(
    execution: Execution,
    timeRangeSelection: TimeRangePickerSelection,
  ): TimeRange {
    const startTime = execution.startTime!;
    const endTime = execution.endTime ?? new Date().getTime();

    switch (timeRangeSelection.type) {
      case 'FULL':
        const fullRange = { from: startTime, to: endTime - 5000 };
        if (fullRange.to - fullRange.from < 0) {
          fullRange.to = endTime;
        }
        return fullRange;
      case 'ABSOLUTE':
        return timeRangeSelection.absoluteSelection!;
      case 'RELATIVE':
        return { from: endTime - timeRangeSelection.relativeSelection!.timeInMs!, to: endTime };
    }
  }

  static convertSelectionToTimeRange(selection: TimeRangePickerSelection): TimeRange {
    let newFullRange: TimeRange;
    switch (selection.type) {
      case 'FULL':
        throw new Error('Full range selection is not supported');
      case 'ABSOLUTE':
        newFullRange = selection.absoluteSelection!;
        break;
      case 'RELATIVE':
        let now = new Date().getTime();
        newFullRange = { from: now - selection.relativeSelection!.timeInMs!, to: now };
        break;
    }
    return newFullRange;
  }

  static formatInputDate(date: Date, includeTime = true): string {
    if (!date) {
      return '';
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const isoDate = `${date.getFullYear()}-${month}-${day}`;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const isoTime = `${hours}:${minutes}:${seconds}`;
    return `${isoDate} ${includeTime ? isoTime : ''}`;
  }

  static ATTRIBUTES_REMOVAL_FUNCTION = (field: string) => {
    if (field.startsWith('attributes.')) {
      return field.replace('attributes.', '');
    } else {
      return field;
    }
  };
}
