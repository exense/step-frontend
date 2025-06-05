import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isEmptyJson',
  standalone: false,
})
export class IsEmptyJsonPipe implements PipeTransform {
  transform(value: unknown): boolean {
    return value == null || value == '{}';
  }
}
