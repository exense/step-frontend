import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractUrl',
  standalone: false,
})
export class ExtractUrlPipe implements PipeTransform {
  transform(value: string): string {
    return value.split('?')[0];
  }
}
