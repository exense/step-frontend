import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'comparePercentage',
})
export class TsComparePercentagePipe implements PipeTransform {
  transform(value: number | undefined, precision: number = 2): any {
    if (value == null) {
      return undefined;
    }
    if (isNaN(value)) {
      return value;
    }
    const prefix = value >= 0 ? '+' : '';
    return prefix + value.toFixed(2);
  }
}
