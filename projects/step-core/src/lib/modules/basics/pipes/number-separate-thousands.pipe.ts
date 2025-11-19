import { Pipe, PipeTransform } from '@angular/core';

const FORMATTER = new Intl.NumberFormat('de-DE');

@Pipe({
  name: 'numberSeparateThousands',
})
export class NumberSeparateThousandsPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return FORMATTER.format(value);
  }
}
