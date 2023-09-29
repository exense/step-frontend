import { Pipe, PipeTransform } from '@angular/core';
import { Execution, ExecutiontTaskParameters, Plan } from '../../../client/generated';

@Pipe({ name: 'castToPlan' })
export class CastEntityToPlanPipe implements PipeTransform {
  transform(value: any): Plan {
    return value as Plan;
  }
}
