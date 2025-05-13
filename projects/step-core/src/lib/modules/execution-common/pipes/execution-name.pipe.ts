import { Pipe, PipeTransform } from '@angular/core';
import { Execution } from '../../../client/step-client-module';

@Pipe({
  name: 'executionName',
  standalone: true,
})
export class ExecutionNamePipe implements PipeTransform {
  transform(execution: Execution): string {
    return ExecutionNamePipe.transform(execution);
  }

  static transform(execution: Execution): string {
    if (!execution.description || execution.description === '') {
      return `unnamed (${execution.id})`;
    }
    return execution.description;
  }
}
