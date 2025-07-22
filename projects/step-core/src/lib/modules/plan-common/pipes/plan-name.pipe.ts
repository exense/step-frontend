import { Pipe, PipeTransform } from '@angular/core';
import { Plan } from '../../../client/step-client-module';

@Pipe({
  name: 'planName',
})
export class PlanNamePipe implements PipeTransform {
  transform(plan?: Plan): string | undefined {
    return PlanNamePipe.transform(plan);
  }

  static transform(plan?: Plan): string | undefined {
    return plan?.attributes?.['name'];
  }
}
