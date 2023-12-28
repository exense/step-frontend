import { inject, Injectable } from '@angular/core';
import { DateAdapterService } from './date-adapter.service';
import { DateSingleAdapterService } from './date-single-adapter.service';
import { DateRange } from '../types/date-range';

@Injectable()
export class DateRangeAdapterService implements DateAdapterService<DateRange> {
  private _dateSingleFormatter = inject(DateSingleAdapterService);

  format(date: DateRange | null | undefined, withTime: boolean): string {
    const start = this._dateSingleFormatter.format(date?.start, withTime);
    const end = this._dateSingleFormatter.format(date?.end, withTime);
    if (!end) {
      return start;
    }
    return `${start} - ${end}`;
  }

  parse(dateStr: string | undefined, withTime: boolean): DateRange | null | undefined {
    if (!dateStr?.trim()) {
      return undefined;
    }

    if (!dateStr.includes('-')) {
      const start = this._dateSingleFormatter.parse(dateStr.trim(), withTime);
      return { start };
    }

    const [start, end] = dateStr.split('-').map((part) => this._dateSingleFormatter.parse(part.trim(), withTime));

    return { start, end };
  }

  areEqual(a?: DateRange | null | undefined, b?: DateRange | null | undefined): boolean {
    if (a === b) {
      return true;
    }

    const startEqual = this._dateSingleFormatter.areEqual(a?.start, b?.start);
    const endEqual = this._dateSingleFormatter.areEqual(a?.end, b?.end);
    return startEqual && endEqual;
  }
}
