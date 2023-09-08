import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'comparePercentage',
})
export class TsComparePercentagePipe implements PipeTransform {
  transform(value: number, precision: number = 2): any {
    if (isNaN(value)) {
      return value;
    }
    const prefix = value >= 0 ? '+' : '-';
    return prefix + value.toFixed(2);
  }
}
