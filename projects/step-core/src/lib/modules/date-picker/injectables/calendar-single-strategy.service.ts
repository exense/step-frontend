import { inject, Injectable } from '@angular/core';
import { CalendarStrategyService } from './calendar-strategy.service';
import { DateTime } from 'luxon';
import { DateSingleAdapterService } from './date-single-adapter.service';
import { Time } from '../types/time';
import { extractTime } from '../types/extract-time';
import { DateRange } from '../types/date-range';

@Injectable()
export class CalendarSingleStrategyService implements CalendarStrategyService<DateTime, Time> {
  private _adapter = inject(DateSingleAdapterService);

  isCurrentSelectionEmpty(currentSelection?: DateTime | null): boolean {
    return !currentSelection;
  }

  handleDateSelection(
    date: DateTime | undefined | null,
    currentSelection: DateTime,
    keepTime: boolean,
  ): DateTime | undefined | null {
    if (this._adapter.areEqual(date, currentSelection)) {
      return currentSelection;
    }
    if (!keepTime || !date || !currentSelection) {
      return date;
    }

    return date.set({ ...extractTime(currentSelection) });
  }

  handleTimeSelection(time: Time | undefined | null, currentSelection: DateTime): DateTime {
    if (!time) {
      return currentSelection;
    }
    return currentSelection.set({ ...time });
  }

  pickRelativeTime(range: DateRange): DateTime | undefined | null {
    return range.end;
  }

  getStartAt(selection?: DateTime | null): DateTime | undefined | null {
    return selection;
  }

  getCalendarModel(selection?: DateTime | null): DateTime | undefined | null {
    return selection;
  }
}
