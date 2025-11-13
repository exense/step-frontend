import { Pipe, PipeTransform } from '@angular/core';

const NUMBER_SUFFIXES = [
  { value: 1e9, symbol: 'B' },
  { value: 1e6, symbol: 'M' },
  { value: 1e3, symbol: 'k' },
  { value: 1, symbol: '' },
];

const TRAILING_ZERO_PATTERN = /\.0+$|(\.[0-9]*[1-9])0+$/;

@Pipe({
  name: 'bigNumber',
  standalone: false,
})
export class BigNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    const suffixItem = NUMBER_SUFFIXES.find((item) => value >= item.value);
    if (!suffixItem) {
      return '0';
    }
    let result = (value / suffixItem.value).toFixed(0);
    result = result.replace(TRAILING_ZERO_PATTERN, '$1');
    result = `${result}${suffixItem.symbol}`;
    return result;
  }
}
