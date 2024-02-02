import { Pipe, PipeTransform } from '@angular/core';
import { ExecutiontTaskParameters } from '../../../client/step-client-module';

@Pipe({ name: 'castToTask' })
export class CastEntityToTaskPipe implements PipeTransform {
  transform(value: any): ExecutiontTaskParameters {
    return value as ExecutiontTaskParameters;
  }
}
