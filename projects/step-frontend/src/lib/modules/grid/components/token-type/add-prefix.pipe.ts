import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addPrefix',
})
export class AddPrefixPipe implements PipeTransform {
  constructor() {}

  transform(str: string, prefix: string): string {
    return prefix.concat(str);
  }
}
