import { Pipe, PipeTransform } from '@angular/core';
import { ReportNode } from '@exense/step-core';

@Pipe({
  name: 'reportNodeDuration',
  standalone: false,
})
export class ReportNodeDurationPipe implements PipeTransform {
  transform(node: ReportNode): number | undefined {
    if (!node.executionTime) {
      return undefined;
    }
    if (node.status === 'RUNNING' || node.duration == null) {
      return Date.now() - node.executionTime;
    }
    return node.duration;
  }
}
