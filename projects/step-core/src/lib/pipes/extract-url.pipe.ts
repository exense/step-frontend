import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractUrl',
})
export class ExtractUrlPipe implements PipeTransform {
  transform(value: string): string {
    return value.split('?')[0];
  }
}
