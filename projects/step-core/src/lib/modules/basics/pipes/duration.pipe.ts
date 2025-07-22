import { Pipe, PipeTransform } from '@angular/core';
import { DateTime, Duration, DurationObjectUnits } from 'luxon';

export interface DurationPipeParams {
  displayFull?: boolean;
  shortenMs?: boolean;
}

type UsedDurationTypeObject = Omit<DurationObjectUnits, 'quarters' | 'weeks'>;
type UsedDurationUnit = keyof UsedDurationTypeObject;

interface DatePart {
  unit: UsedDurationUnit;
  value: number;
  displayValue: string;
}

const SUFFIXES: Record<UsedDurationUnit, string> = {
  years: 'y',
  months: 'mo',
  days: 'd',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
  milliseconds: 'ms',
};

const UNITS_ORDER: UsedDurationUnit[] = ['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'months', 'years'];

@Pipe({
  name: 'duration',
  standalone: false,
})
export class DurationPipe implements PipeTransform {
  transform(
    end?: number | Date | DateTime,
    start: number | Date | DateTime = 0,
    param?: DurationPipeParams | boolean,
  ): string {
    const endMs = this.getMs(end);

    if (!endMs) {
      return '';
    }

    const { displayFull, shortenMs } = this.getParams(param);

    const startMs = start !== undefined ? this.getMs(start)! : 0;
    const duration = Duration.fromMillis(endMs - startMs).rescale();

    const parts = UNITS_ORDER.reduce(
      (res, unit) => {
        res[unit] = this.createDatePart(duration, unit);
        return res;
      },
      {} as Record<UsedDurationUnit, DatePart>,
    );

    let partsToDisplay = [parts.years, parts.months, parts.days, parts.hours, parts.minutes, parts.seconds];
    if (!shortenMs) {
      partsToDisplay.push(parts.milliseconds);
    }
    partsToDisplay = partsToDisplay.filter((item) => !!item.value);
    if (partsToDisplay.length === 0 && parts.milliseconds.value > 0) {
      return '< 1s';
    }

    if (!displayFull) {
      partsToDisplay = partsToDisplay.slice(0, 2);
    }

    if (partsToDisplay.length === 1) {
      const unitIndex = UNITS_ORDER.indexOf(partsToDisplay[0].unit);
      const lowerNeighbourUnit = UNITS_ORDER[unitIndex - 1];
      if (!!lowerNeighbourUnit) {
        partsToDisplay.push(parts[lowerNeighbourUnit]);
      }
    }

    return partsToDisplay.map((item) => item.displayValue).join(' ');
  }

  private createDatePart(duration: Duration, unit: UsedDurationUnit): DatePart {
    const value = duration.get(unit);
    const suffix = SUFFIXES[unit];
    const displayValue = `${value}${suffix}`;
    return { unit, value, displayValue };
  }

  private getMs(value?: number | Date | DateTime): number | undefined {
    if (value instanceof Date) {
      return value.getTime();
    }
    if (DateTime.isDateTime(value)) {
      return value.toMillis();
    }
    if (typeof value === 'number') {
      return value;
    }
    return undefined;
  }

  private getParams(params?: boolean | DurationPipeParams): Required<DurationPipeParams> {
    if (!params) {
      return {
        displayFull: false,
        shortenMs: false,
      };
    }
    if (typeof params === 'boolean') {
      return {
        displayFull: !!params,
        shortenMs: false,
      };
    }
    return {
      displayFull: !!params.displayFull,
      shortenMs: !!params.shortenMs,
    };
  }
}
