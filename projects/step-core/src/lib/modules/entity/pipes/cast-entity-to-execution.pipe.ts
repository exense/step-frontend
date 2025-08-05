import { Pipe, PipeTransform } from '@angular/core';
import { Execution } from '../../../client/generated';

@Pipe({
  name: 'castToExecution',
  standalone: false,
})
export class CastEntityToExecutionPipe implements PipeTransform {
  transform(value: any): Execution {
    return value as Execution;
  }
}
