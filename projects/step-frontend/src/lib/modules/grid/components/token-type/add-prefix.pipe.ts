import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addPrefix',
})
export class AddPrefixPipe implements PipeTransform {
  transform(str: string, prefix: string): string {
    return prefix.concat(str);
  }
}
