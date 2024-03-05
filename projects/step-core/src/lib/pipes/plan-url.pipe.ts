import { Pipe, PipeTransform } from '@angular/core';
import { Plan } from '../client/step-client-module';

@Pipe({
  name: 'planUrl',
})
export class PlanUrlPipe implements PipeTransform {
  static transform(idOrPlan?: string | Plan): string {
    if (!idOrPlan) {
      return '';
    }
    const id = (typeof idOrPlan === 'string' ? idOrPlan : idOrPlan.id);
    return `/plans/editor/${id}`;
  }

  transform(idOrPlan?: string | Plan): string {
    return PlanUrlPipe.transform(idOrPlan);
  }
}
