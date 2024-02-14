import { Pipe, PipeTransform } from '@angular/core';
import { FilterBarItem } from '../performance-view/filter-bar/model/filter-bar-item';

@Pipe({
  name: 'visibleFilterItems',
})
export class VisibleFilterBarItemPipe implements PipeTransform {
  transform(value?: FilterBarItem[]): FilterBarItem[] {
    return (value || []).filter((item) => !item.isHidden);
  }
}