import { Pipe, PipeTransform } from '@angular/core';
import { StackViewInfo } from '../types/stack-view-info';

@Pipe({
  name: 'viewItemDefaultName',
})
export class ViewItemDefaultNamePipe implements PipeTransform {
  transform(item: StackViewInfo, isFull?: boolean): string {
    if (isFull) {
      return item.title ?? item.id;
    }
    return item.title?.[0] ?? item.id[0];
  }
}
