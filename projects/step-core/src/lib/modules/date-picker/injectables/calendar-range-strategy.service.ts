import { inject, Injectable } from '@angular/core';
import { CalendarStrategyService } from './calendar-strategy.service';
import { DateTime } from 'luxon';
import { DateRange } from '../types/date-range';
import { DateRange as MatDateRange } from '@angular/material/datepicker';
import { TimeRange } from '../types/time-range';
import { Time } from '../types/time';
import { extractTime } from '../types/extract-time';
import { DateUtilsService } from './date-utils.service';

const END_RANGE_TIME: Time = { hour: 23, minute: 59, second: 59 };

@Injectable()
export class CalendarRangeStrategyService implements CalendarStrategyService<DateRange, TimeRange> {
  private _dateUtils = inject(DateUtilsService);

  private lastEndDate: DateTime | null = null;
  private lastEndTime?: Time;

  isCurrentSelectionEmpty(currentSelection?: DateRange | null): boolean {
    return !currentSelection?.start && !currentSelection?.end;
  }

  handleDateSelection(
    date: DateTime | null | undefined,
    currentSelection: DateRange,
    keepTime: boolean,
  ): DateRange | null | undefined {
    let start = currentSelection?.start;
    let end = this.lastEndDate;

    if (!start) {
      start = date ?? null;
      if (start && !end) {
        end = start.set(END_RANGE_TIME);
      }
    } else if (
      (!end || this._dateUtils.compareWithoutTime(start, end) === 0) &&
      date &&
      this._dateUtils.compare(date, start) >= 0
    ) {
      if (!keepTime) {
        end = date;
        this.lastEndDate = end;
      } else {
        end = date.set(this.lastEndTime ?? END_RANGE_TIME);
        this.lastEndDate = end;
      }
    } else {
      if (!keepTime || !date) {
        start = date ?? null;
      } else {
        start = date.set({ ...extractTime(start) });
      }

      if (start) {
        end = start.set(this.lastEndTime ?? END_RANGE_TIME);
      } else {
        end = null;
      }
      this.lastEndDate = null;
    }
    return { start, end };
  }

  handleTimeSelection(time: TimeRange | undefined | null, currentSelection: DateRange): DateRange | undefined | null {
    if (!time?.start && !time?.end) {
      this.lastEndTime = undefined;
      return currentSelection;
    }

    let start = currentSelection.start;
    let end = this.lastEndDate ?? currentSelection.end;

    let startChanged = false;
    let endChanged = false;

    if (start && time.start) {
      start = start.set({ ...time.start });
      startChanged = true;
    }
    if (time.end) {
      const potentialEnd = end ?? start;
      if (potentialEnd) {
        end = potentialEnd.set({ ...time.end });
        this.lastEndDate = end;
        endChanged = true;
      }
      this.lastEndTime = time.end;
    } else {
      this.lastEndTime = undefined;
    }

    if (startChanged || endChanged) {
      return { start, end };
    }

    return currentSelection;
  }

  pickRelativeTime(range: DateRange): DateRange | undefined | null {
    return range;
  }

  getStartAt(selection?: DateRange | null): DateTime | undefined | null {
    return selection?.start;
  }

  getCalendarModel(selection?: DateRange | null): MatDateRange<DateTime> | undefined | null {
    if (!selection) {
      return selection;
    }

    return new MatDateRange(selection.start ?? null, selection.end ?? null);
  }
}
