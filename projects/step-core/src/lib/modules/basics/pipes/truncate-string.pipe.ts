import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateString',
})
export class TruncateStringPipe implements PipeTransform {
  transform(value: string, maxChars: number, overflowSuffix: string = '...'): string {
    if (maxChars <= 0 || value.length <= maxChars) {
      return value;
    }

    if (maxChars > overflowSuffix.length) {
      const result = value.slice(0, maxChars - overflowSuffix.length);
      return `${result}${overflowSuffix}`;
    }

    return value.slice(0, maxChars);
  }
}
