import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'flatObjectStringFormat',
  standalone: false,
})
export class FlatObjectStringFormatPipe implements PipeTransform {
  static format(obj: any): string {
    let str = '';
    for (let key of Object.keys(obj)) {
      str = str.concat(key).concat('=').concat(obj[key]).concat(', ');
    }
    return str;
  }

  transform(obj: any): string {
    return FlatObjectStringFormatPipe.format(obj);
  }
}
