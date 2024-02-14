import { Pipe, PipeTransform } from '@angular/core';
import { DateTime, Duration } from 'luxon';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(end?: number | Date | DateTime, start?: number | Date | DateTime, displayFull = false): string {
    const endMs = this.getMs(end);
    const startMs = this.getMs(start);
    if (!endMs || !startMs) {
      return '';
    }
    const duration = Duration.fromMillis(endMs - startMs).rescale();
    const day = this.addSuffix(duration.get('days'), 'd');
    const hour = this.addSuffix(duration.get('hours'), 'h');
    const minute = this.addSuffix(duration.get('minutes'), 'm');
    const second = this.addSuffix(duration.get('seconds'), 's');
    const ms = this.addSuffix(duration.get('milliseconds'), 'ms');

    let partsToDisplay = [day, hour, minute, second, ms].filter((item) => !!item);
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
