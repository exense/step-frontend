import { inject, Injectable } from '@angular/core';
import { DateAdapterService } from './date-adapter.service';
import { DateTime, HourNumbers, SecondNumbers } from 'luxon';
import { STEP_DATE_TIME_DELIMITER, STEP_FORMAT_DATE, STEP_FORMAT_TIME } from './step-date-format-config.providers';
import { DateUtilsService } from './date-utils.service';

@Injectable()
export class DateSingleAdapterService implements DateAdapterService<DateTime> {
  private _formatDate = inject(STEP_FORMAT_DATE);
  private _formatTime = inject(STEP_FORMAT_TIME);
  private _dateTimeDelimiter = inject(STEP_DATE_TIME_DELIMITER);
  private _dateUtils = inject(DateUtilsService);

  format(date: DateTime | null | undefined, withTime: boolean): string {
    if (!date) {
      return '';
    }

    const format =
      !withTime || !this.hasTimePart(date)
        ? this._formatDate
        : `${this._formatDate}${this._dateTimeDelimiter}${this._formatTime}`;

    return date.toFormat(format);
  }

  parse(dateStr: string, withTime: boolean): DateTime | null | undefined {
    dateStr = dateStr.trim();
    if (!withTime || !dateStr.includes(this._dateTimeDelimiter)) {
      return this.parseDatePart(dateStr);
    }

    const [datePartStr, timePartStr] = dateStr.split(this._dateTimeDelimiter).map((part) => part.trim());
    let date = this.parseDatePart(datePartStr);
    if (date) {
      const time = this.parseTime(timePartStr);
      if (time) {
        date = date.set(time);
      }
    }

    return date;
  }

  areEqual(a: DateTime | null | undefined, b: DateTime | null | undefined): boolean {
    return this._dateUtils.areDatesEqual(a, b);
  }

  parseTime(timePartStr: string): { hour: HourNumbers; minute: SecondNumbers; second: SecondNumbers } | undefined {
    const time = DateTime.fromFormat(timePartStr, this._formatTime);
    if (!time.isValid) {
      return undefined;
    }
    const { hour, minute, second } = time;
    return { hour, minute, second };
  }

  private parseDatePart(dateStr: string): DateTime | null | undefined {
    const date = DateTime.fromFormat(dateStr, this._formatDate);
    return date.isValid ? date : undefined;
  }

  private hasTimePart(date: DateTime): boolean {
    return date.hour > 0 || date.minute > 0 || date.second > 0;
  }
}
