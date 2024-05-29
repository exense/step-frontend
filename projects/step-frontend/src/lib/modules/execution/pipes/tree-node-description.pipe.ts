import { Pipe, PipeTransform } from '@angular/core';
import { BREAK_LINE, DEFAULT_DECORATION_INDEX } from '@exense/step-core';

@Pipe({
  name: 'treeNodeDescription',
})
export class TreeNodeDescriptionPipe implements PipeTransform {
  transform(value?: string): string {
    if (!value) {
      return '';
    }
    let size = DEFAULT_DECORATION_INDEX;
    if (value.includes(BREAK_LINE)) {
      size = value.indexOf(BREAK_LINE);
    }
    return value.slice(0, size);
  }
}
