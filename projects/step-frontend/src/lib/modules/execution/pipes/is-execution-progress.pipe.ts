import { Pipe, PipeTransform } from '@angular/core';
import { Execution } from '@exense/step-core';

@Pipe({
  name: 'isExecutionProgress',
})
export class IsExecutionProgressPipe implements PipeTransform {
  transform(execution: Execution): boolean {
    return execution.result === 'RUNNING';
  }
}
