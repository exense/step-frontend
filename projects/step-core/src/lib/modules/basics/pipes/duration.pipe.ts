import { Pipe, PipeTransform } from '@angular/core';
import { DateTime, Duration } from 'luxon';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(end?: number | Date | DateTime, start: number | Date | DateTime = 0, displayFull = false): string {
    const endMs = this.getMs(end);

    if (!endMs) {
      return '';
    }

    const startMs = start !== undefined ? this.getMs(start)! : 0;
    const duration = Duration.fromMillis(endMs - startMs).rescale();
    const year = this.addSuffix(duration.get('years'), 'y');
    const month = this.addSuffix(duration.get('months'), 'mo');
    const day = this.addSuffix(duration.get('days'), 'd');
    const hour = this.addSuffix(duration.get('hours'), 'h');
    const minute = this.addSuffix(duration.get('minutes'), 'm');
    const second = this.addSuffix(duration.get('seconds'), 's');

    const ms = duration.get('millisecond');

    let partsToDisplay = [year, month, day, hour, minute, second].filter((item) => !!item);
    if (partsToDisplay.length === 0 && ms > 0) {
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
}
