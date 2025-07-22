import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedReportView } from '@exense/step-core';

@Pipe({
  name: 'isAverageDuration',
  standalone: false,
})
export class IsAverageDurationPipe implements PipeTransform {
  transform(value?: AggregatedReportView): boolean {
    const count = value?.bucketsByStatus?.['ALL']?.count;
    if (count === undefined) {
      return false;
    }
    return count > 1;
  }
}
