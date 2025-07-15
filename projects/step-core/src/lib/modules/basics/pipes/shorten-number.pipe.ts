import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';

const SUFFIXES: KeyValue<string, number>[] = [
  { key: 'B', value: Math.pow(10, 9) },
  { key: 'M', value: Math.pow(10, 6) },
  { key: 'K', value: Math.pow(10, 3) },
];

@Pipe({
  name: 'shortenNumber',
  standalone: false,
})
export class ShortenNumberPipe implements PipeTransform {
  transform(value?: number | null, defaultSuffix = ''): string {
    if (value === null || value === undefined) {
      return '';
    }
    const isNegative = value < 0;
    let abs = Math.abs(value);
    let suffix = defaultSuffix;
    for (let i = 0; i < SUFFIXES.length; i++) {
      const suffixItem = SUFFIXES[i];
      if (abs < suffixItem.value) {
        continue;
      }
      const remain = abs % suffixItem.value;
      abs = (abs - remain) / suffixItem.value;
      if (remain > suffixItem.value / 2) {
        abs++;
      }
      suffix = suffixItem.key;
      break;
    }
    return `${isNegative ? '-' : ''}${abs}${suffix}`;
  }
}
