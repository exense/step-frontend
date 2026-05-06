import { Pipe, PipeTransform } from '@angular/core';
import { BREAK_LINE, DEFAULT_DECORATION_INDEX } from '@exense/step-core';

@Pipe({
  name: 'treeNodeDescription',
  standalone: false,
})
export class TreeNodeDescriptionPipe implements PipeTransform {
  transform(value?: string, truncate = true): string {
    if (!value) {
      return '';
    }
    value = this.stripHtml(value);
    if (!truncate) {
      return value;
    }
    let size = DEFAULT_DECORATION_INDEX;
    if (value.includes(BREAK_LINE)) {
      size = value.indexOf(BREAK_LINE);
    }
    return value.slice(0, size);
  }

  private stripHtml(value: string): string {
    return value.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '');
  }
}
