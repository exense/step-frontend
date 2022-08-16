import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isEmptyJson',
})
export class IsEmptyJsonPipe implements PipeTransform {
  transform(value: unknown): boolean {
    return value == null || value == '{}';
  }
}
