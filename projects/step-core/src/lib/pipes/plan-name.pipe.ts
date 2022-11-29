import { Pipe, PipeTransform } from '@angular/core';
import { Plan } from '../step-core.module';

@Pipe({
  name: 'planName',
})
export class PlanNamePipe implements PipeTransform {
  transform(plan: Plan): string | undefined {
    return plan.attributes?.['name'];
  }
}
