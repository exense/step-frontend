import { DateTime } from 'luxon';
import { DateRange as MatDateRange } from '@angular/material/datepicker';
import { DateRange } from '../types/date-range';

export abstract class CalendarStrategyService<D, T> {
  abstract isCurrentSelectionEmpty(currentSelection?: D | null): boolean;
  abstract handleDateSelection(
    date: DateTime | undefined | null,
    currentSelection: D,
    keepTime: boolean,
  ): D | undefined | null;
  abstract handleTimeSelection(time: T | undefined | null, currentSelection: D): D | undefined | null;
  abstract pickRelativeTime(range: DateRange): D | undefined | null;
  abstract getStartAt(selection?: D | null): DateTime | undefined | null;
  abstract getCalendarModel(selection?: D | null): DateTime | MatDateRange<DateTime> | undefined | null;
}
