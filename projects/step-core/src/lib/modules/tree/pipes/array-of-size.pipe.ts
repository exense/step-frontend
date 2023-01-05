import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayOfSize',
})
export class ArrayOfSizePipe implements PipeTransform {
  transform(size: number): number[] {
    return Array.from(new Array(size), (_, i) => i);
  }
}
