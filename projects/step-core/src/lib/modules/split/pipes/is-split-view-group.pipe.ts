import { Pipe, PipeTransform } from '@angular/core';
import { StackViewInfo, StackViewInfoGroup } from '../types/stack-view-info';

@Pipe({
  name: 'isSplitViewGroup',
})
export class IsSplitViewGroupPipe implements PipeTransform {
  transform(value?: StackViewInfo): StackViewInfoGroup | undefined {
    if (!!value && !!(value as StackViewInfoGroup).children) {
      return value as StackViewInfoGroup;
    }
    return undefined;
  }
}
