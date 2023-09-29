import { Pipe, PipeTransform } from '@angular/core';
import { Execution, ExecutiontTaskParameters } from '../../../client/generated';

@Pipe({ name: 'castToTask' })
export class CastEntityToTaskPipe implements PipeTransform {
  transform(value: any): ExecutiontTaskParameters {
    return value as ExecutiontTaskParameters;
  }
}
