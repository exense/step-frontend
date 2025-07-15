import { Pipe, PipeTransform } from '@angular/core';
import { Status } from '../../_common/step-common.module';

const STATUSES_PRIORITY: Status[] = [
  Status.TECHNICAL_ERROR,
  Status.FAILED,
  Status.ENDED,
  Status.PASSED,
  Status.RUNNING,
];

@Pipe({
  name: 'appliedStatus',
  standalone: false,
})
export class AppliedStatusPipe implements PipeTransform {
  transform(aggregatedStatus: Record<string, number> = {}): Status | undefined {
    const statuses = Object.keys(aggregatedStatus) as Status[];
    const usedStatuses = new Set(statuses);
    for (let status of STATUSES_PRIORITY) {
      if (usedStatuses.has(status)) {
        return status as Status;
      }
    }
    return statuses[0] as Status;
  }
}
