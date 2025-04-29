import { Pipe, PipeTransform } from '@angular/core';
import { Execution } from '@exense/step-core';

@Pipe({
  name: 'executionName',
  standalone: true,
})
export class ExecutionNamePipe implements PipeTransform {
  transform(execution: Execution): string {
    return ExecutionNamePipe.transform(execution);
  }

  static transform(execution: Execution): string {
    return execution.description ?? `unnamed (${execution.id})`;
  }
}
