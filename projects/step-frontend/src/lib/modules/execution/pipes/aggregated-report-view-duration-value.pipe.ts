import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedReportView } from '@exense/step-core';

@Pipe({
  name: 'aggregatedReportViewDurationValue',
  standalone: false,
})
export class AggregatedReportViewDurationValuePipe implements PipeTransform {
  transform(value?: AggregatedReportView): number | undefined {
    const allBucket = value?.bucketsByStatus?.['ALL'];
    if (!allBucket) {
      return undefined;
    }
    const sum = allBucket.sum ?? 0;
    const count = allBucket?.count ?? 0;
    if (sum <= 0 || count <= 0) {
      return undefined;
    }
    return Math.round(sum / count);
  }
}
