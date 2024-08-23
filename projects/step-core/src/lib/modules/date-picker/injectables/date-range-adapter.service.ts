import { inject, Injectable } from '@angular/core';
import { DateAdapterService } from './date-adapter.service';
import { DateSingleAdapterService } from './date-single-adapter.service';
import { DateRange } from '../types/date-range';
import { STEP_DATE_TIME_DELIMITER, STEP_FORMAT_DATE, STEP_FORMAT_TIME } from './step-date-format-config.providers';
import { DateTime } from 'luxon';
import { DateUtilsService } from './date-utils.service';

@Injectable()
export class DateRangeAdapterService implements DateAdapterService<DateRange> {
  private _dateSingleFormatter = inject(DateSingleAdapterService);

  private _formatDate = inject(STEP_FORMAT_DATE);
  private _formatTime = inject(STEP_FORMAT_TIME);
  private _dateTimeDelimiter = inject(STEP_DATE_TIME_DELIMITER);
  private _dateUtils = inject(DateUtilsService);

  format(date: DateRange | null | undefined, withTime: boolean): string {
    if (!date) {
      return '';
    }

    if (!date.end || this._dateUtils.areDatesEqual(date.start, date.end)) {
      return this.formatSingleDate(date.start, withTime);
    }

    if (withTime && this._dateUtils.compareWithoutTime(date.start, date.end) === 0) {
      const strDate = this.formatSingleDate(date.start, false);
      const start = this.formatTimeOnly(date.start);
      const end = this.formatTimeOnly(date.end);
      return `${strDate} ${start} - ${end}`;
    }

    const start = this.formatSingleDate(date?.start, withTime);
    const end = this.formatSingleDate(date?.end, withTime);
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

    const [partStart, partEnd] = dateStr.split('-').map((part) => part.trim());
    if (partStart.length === partEnd.length) {
      const [start, end] = [partStart, partEnd].map((part) => this._dateSingleFormatter.parse(part, withTime));
      return { start, end };
    }

    const start = this._dateSingleFormatter.parse(partStart, withTime)!;
    const endTime = this._dateSingleFormatter.parseTime(partEnd)!;
    const end = start.set(endTime);

    return { start, end };
  }

  areEqual(a?: DateRange | null | undefined, b?: DateRange | null | undefined): boolean {
    if (a === b) {
      return true;
    }

    const startEqual = this._dateUtils.areDatesEqual(a?.start, b?.start);
    const endEqual = this._dateUtils.areDatesEqual(a?.end, b?.end);
    return startEqual && endEqual;
  }

  private formatSingleDate(date: DateTime | null | undefined, withTime: boolean): string {
    if (!date) {
      return '';
    }

    const format = !withTime ? this._formatDate : `${this._formatDate}${this._dateTimeDelimiter}${this._formatTime}`;

    return date.toFormat(format);
  }

  private formatTimeOnly(date: DateTime | null | undefined): string {
    return date?.toFormat(this._formatTime) ?? '';
  }
}
