import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedReportView } from '@exense/step-core';

@Pipe({
  name: 'aggregatedReportViewCountErrors',
})
export class AggregatedReportViewCountErrorsPipe implements PipeTransform {
  transform(item?: AggregatedReportView): number {
    let result = 0;
    Object.values(item?.countByErrorMessage ?? {}).forEach((count) => (result += count));
    Object.values(item?.countByChildrenErrorMessage ?? {}).forEach((count) => (result += count));
    return result;
  }
}
