import { TSTimeRange } from './chart/model/ts-time-range';
import { FilterBarItemType, TsFilterItem } from './performance-view/filter-bar/model/ts-filter-item';
import { Execution } from '@exense/step-core';
import { RangeSelectionType } from './time-selection/model/range-selection-type';
import { TimeRangePickerSelection } from './time-selection/time-range-picker-selection';

export class TimeSeriesUtils {
  static createTimeLabels(start: number, end: number, interval: number): number[] {
    let intervals = Math.ceil((end - start) / interval);
    const result = Array(intervals);
    for (let i = 0; i < intervals; i++) {
      result[i] = start + i * interval; //
    }
    // result[intervals] = result[intervals - 1] + TimeSeriesConfig.RESOLUTION; // we add one second as a small padding

    return result;
  }

  static intervalIsInside(bigInterval: TSTimeRange, smallInterval: TSTimeRange): boolean {
    return !(bigInterval.from > smallInterval.from || bigInterval.to < smallInterval.to);
  }

  /**
   * If the intervals do not overlap, this method will return indefined.
   * @param boundaries
   * @param interval
   */
  static cropInterval(boundaries: TSTimeRange, interval: TSTimeRange): TSTimeRange | undefined {
    if (!this.intervalsOverlap(boundaries, interval)) {
      return undefined;
    }
    return { from: Math.max(boundaries.from, interval.from), to: Math.min(boundaries.to, interval.to) };
  }

  static intervalsOverlap(range1: TSTimeRange, range2: TSTimeRange) {
    return range1.from <= range2.to && range2.from <= range1.to;
  }

  static intervalsEqual(range1?: TSTimeRange, range2?: TSTimeRange) {
    return range1 && range2 && range1.from === range2.from && range1.to === range2.to;
  }

  static convertExecutionAndSelectionToTimeRange(
    execution: Execution,
    timeRangeSelection: TimeRangePickerSelection
  ): TSTimeRange {
    const now = new Date().getTime();
    let selection: TSTimeRange;
    let newFullRange: TSTimeRange;
    switch (timeRangeSelection.type) {
      case RangeSelectionType.FULL:
        newFullRange = { from: execution.startTime!, to: execution.endTime || now - 5000 };
        selection = newFullRange;
        break;
      case RangeSelectionType.ABSOLUTE:
        newFullRange = timeRangeSelection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        const end = execution.endTime || now;
        newFullRange = { from: end - timeRangeSelection.relativeSelection!.timeInMs!, to: end };
        break;
    }
    return newFullRange;
  }

  static convertSelectionToTimeRange(selection: TimeRangePickerSelection): TSTimeRange {
    let now = new Date().getTime();
    let newFullRange: TSTimeRange;
    switch (selection.type) {
      case RangeSelectionType.FULL:
        throw new Error('Full range selection is not supported');
      case RangeSelectionType.ABSOLUTE:
        newFullRange = selection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        let end = now;
        newFullRange = { from: end - selection.relativeSelection!.timeInMs!, to: end };
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
