import { Execution, TimeRange } from '@exense/step-core';
import { TimeRangePickerSelection } from './../time-selection/time-range-picker-selection';
import { TimeSeriesConfig } from './time-series.config';
import { ChartAggregation } from '../chart-aggregation';

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

  static getAxesFormatFunction(aggregation: ChartAggregation, unit?: string): (v: number) => string {
    if (aggregation === ChartAggregation.RATE) {
      return (v) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v) + '/h';
    }
    if (!unit) {
      return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber;
    }
    switch (unit) {
      case '1':
        return (v) => v.toString() + this.getUnitLabel(aggregation, unit);
      case 'ms':
        return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.time;
      case '%':
        return (v) => v.toString() + this.getUnitLabel(aggregation, unit);
      default:
        throw new Error('Unit not handled: ' + unit);
    }
  }

  static getUnitLabel(aggregation: ChartAggregation, unit: string): string {
    if (aggregation === 'RATE') {
      return '/ h';
    }
    switch (unit) {
      case '%':
        return '%';
      case 'ms':
        return ' ms';
      default:
        return '';
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
