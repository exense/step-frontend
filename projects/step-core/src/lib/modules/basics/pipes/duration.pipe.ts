import { Pipe, PipeTransform } from '@angular/core';
import { DateTime, Duration } from 'luxon';

export interface DurationPipeParams {
  displayFull?: boolean;
  shortenMs?: boolean;
}

@Pipe({
  name: 'duration',
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
    const year = this.addSuffix(duration.get('years'), 'y');
    const month = this.addSuffix(duration.get('months'), 'mo');
    const day = this.addSuffix(duration.get('days'), 'd');
    const hour = this.addSuffix(duration.get('hours'), 'h');
    const minute = this.addSuffix(duration.get('minutes'), 'm');
    const second = this.addSuffix(duration.get('seconds'), 's');

    const ms = duration.get('millisecond');

    let partsToDisplay = [year, month, day, hour, minute, second];
    if (!shortenMs) {
      const milliseconds = this.addSuffix(ms, 'ms');
      partsToDisplay.push(milliseconds);
    }
    partsToDisplay = partsToDisplay.filter((item) => !!item);

    if (!shortenMs && partsToDisplay.length === 0 && ms > 0) {
      return '< 1s';
    }

    if (!displayFull) {
      partsToDisplay = partsToDisplay.slice(0, 2);
    }

    return partsToDisplay.join(' ');
  }

  private addSuffix(num: number, suffix: string): string {
    if (num <= 0) {
      return '';
    }
    return `${num}${suffix}`;
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
        displayFull: true,
        shortenMs: false,
      };
    }
    if (typeof params === 'boolean') {
      return {
        displayFull: !params,
        shortenMs: false,
      };
    }
    return {
      displayFull: !!params.displayFull,
      shortenMs: !!params.shortenMs,
    };
  }
}
