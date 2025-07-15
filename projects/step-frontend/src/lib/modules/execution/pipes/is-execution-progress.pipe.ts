import { Pipe, PipeTransform } from '@angular/core';
import { Execution } from '@exense/step-core';

@Pipe({
  name: 'isExecutionProgress',
  standalone: false,
})
export class IsExecutionProgressPipe implements PipeTransform {
  transform(execution: Execution): boolean {
    return execution.result === 'RUNNING';
  }
}
