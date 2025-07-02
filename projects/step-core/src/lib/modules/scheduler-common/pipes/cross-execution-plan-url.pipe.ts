import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { Plan } from '../../../client/generated';

@Pipe({
  name: 'crossExecutionPlanUrl',
  standalone: true,
})
export class CrossExecutionPlanUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  transform(idOrPlan: string | Plan): string {
    return this._commonEntitiesUrls.crossExecutionPlanPageUrl(idOrPlan);
  }
}
