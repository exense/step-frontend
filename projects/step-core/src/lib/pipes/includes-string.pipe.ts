import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'includesString', standalone: false, pure: true })
export class IncludesStringPipe implements PipeTransform {
  transform(value: string | null | undefined, search: string): boolean {
    return !!value && value.includes(search);
  }
}
