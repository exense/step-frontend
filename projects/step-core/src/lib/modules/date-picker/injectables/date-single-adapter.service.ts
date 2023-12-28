import { inject, Injectable } from '@angular/core';
import { DateAdapterService } from './date-adapter.service';
import { DateTime } from 'luxon';
import { STEP_DATE_TIME_DELIMITER, STEP_FORMAT_DATE, STEP_FORMAT_TIME } from './step-date-format-config.providers';

@Injectable()
export class DateSingleAdapterService implements DateAdapterService<DateTime> {
  private _formatDate = inject(STEP_FORMAT_DATE);
  private _formatTime = inject(STEP_FORMAT_TIME);
  private _dateTimeDelimiter = inject(STEP_DATE_TIME_DELIMITER);

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
      const time = DateTime.fromFormat(timePartStr, this._formatTime);
      if (time.isValid) {
        const { hour, minute, second } = time;
        date = date.set({ hour, minute, second });
      }
    }

    return date;
  }

  areEqual(a: DateTime | null | undefined, b: DateTime | null | undefined): boolean {
    return a === b || this.compare(a, b) === 0;
  }

  compare(a: DateTime | null | undefined, b: DateTime | null | undefined): number {
    const aMillis = a?.toMillis() ?? 0;
    const bMillis = b?.toMillis() ?? 0;
    return aMillis - bMillis;
  }

  private parseDatePart(dateStr: string): DateTime | null | undefined {
    const date = DateTime.fromFormat(dateStr, this._formatDate);
    return date.isValid ? date : undefined;
  }

  private hasTimePart(date: DateTime): boolean {
    return date.hour > 0 || date.minute > 0 || date.second > 0;
  }
}
