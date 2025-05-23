import { Injectable } from '@angular/core';
import { DateObjectUnits, DateTime } from 'luxon';
import { DateRange } from '../types/date-range';
import { TimeRange, TimeRangeSelection } from '../../../client/step-client-module';

@Injectable({
  providedIn: 'root',
})
export class DateUtilsService {
  areDatesEqual(
    a: DateTime | null | undefined,
    b: DateTime | null | undefined,
    measurementErrorMs: number = 0,
  ): boolean {
    return a === b || Math.abs(this.compare(a, b)) <= measurementErrorMs;
  }

  compare(a: DateTime | null | undefined, b: DateTime | null | undefined): number {
    const aMillis = a?.toMillis() ?? 0;
    const bMillis = b?.toMillis() ?? 0;
    return aMillis - bMillis;
  }

  compareWithoutTime(a: DateTime | null | undefined, b: DateTime | null | undefined): number {
    const zeroTime: DateObjectUnits = { hour: 0, minute: 0, second: 0, millisecond: 0 };
    const aMillis = a?.set(zeroTime)?.toMillis() ?? 0;
    const bMillis = b?.set(zeroTime)?.toMillis() ?? 0;
    return aMillis - bMillis;
  }

  dateRange2TimeRange(dateRange?: DateRange | null): TimeRange | undefined {
    if (!dateRange) {
      return undefined;
    }
    const from = dateRange.start?.toMillis() ?? 0;
    const to = dateRange.end?.toMillis() ?? 0;
    if (from >= to) {
      return undefined;
    }
    return { from, to };
  }

  timeRange2DateRange(timeRange?: TimeRange | null): DateRange | undefined {
    if (!timeRange) {
      return undefined;
    }
    const start = DateTime.fromMillis(timeRange.from);
    const end = DateTime.fromMillis(timeRange.to);
    return { start, end };
  }

  areTimeRangeSelectionsEquals(a?: TimeRangeSelection, b?: TimeRangeSelection): boolean {
    if (a === b) {
      return true;
    }

    if ((!a && !!b) || (!!a && !b)) {
      return false;
    }

    if (
      (a?.type === 'FULL' && b?.type === 'FULL') ||
      (a?.type === 'ABSOLUTE' &&
        b?.type === 'ABSOLUTE' &&
        a?.absoluteSelection?.from === b?.absoluteSelection?.from &&
        a?.absoluteSelection?.to === b?.absoluteSelection?.to) ||
      (a?.type === 'RELATIVE' &&
        b?.type === 'RELATIVE' &&
        a?.relativeSelection?.timeInMs === b?.relativeSelection?.timeInMs)
    ) {
      return true;
    }

    return false;
  }
}
