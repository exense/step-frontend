import { Pipe, PipeTransform } from '@angular/core';
import { FilterBarItem } from '../../_common';

@Pipe({
  name: 'visibleFilterItems',
  standalone: true,
})
export class VisibleFilterBarItemPipe implements PipeTransform {
  transform(value?: FilterBarItem[]): FilterBarItem[] {
    return (value || []).filter((item) => !item.isHidden);
  }
}
