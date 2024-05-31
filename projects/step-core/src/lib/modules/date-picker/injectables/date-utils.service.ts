import { Injectable } from '@angular/core';
import { DateObjectUnits, DateTime } from 'luxon';

@Injectable({
  providedIn: 'root',
})
export class DateUtilsService {
  areDatesEqual(a: DateTime | null | undefined, b: DateTime | null | undefined): boolean {
    return a === b || this.compare(a, b) === 0;
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
}
