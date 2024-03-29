import { Pipe, PipeTransform } from '@angular/core';
import { Plan } from '../../../client/step-client-module';

@Pipe({ name: 'castToPlan' })
export class CastEntityToPlanPipe implements PipeTransform {
  transform(value: any): Plan {
    return value as Plan;
  }
}
