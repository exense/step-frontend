import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noticeBadgeLabel',
  standalone: false,
})
export class NoticeBadgeLabelPipe implements PipeTransform {
  transform(count: number): string {
    if (count === 0) {
      return '';
    }
    return count < 10 ? count.toString() : '+';
  }
}
