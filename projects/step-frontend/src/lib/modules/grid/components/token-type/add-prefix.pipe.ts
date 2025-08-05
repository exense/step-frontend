import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addPrefix',
  standalone: false,
})
export class AddPrefixPipe implements PipeTransform {
  transform(str: string, prefix: string): string {
    return prefix.concat(str);
  }
}
