import { inject, Pipe, PipeTransform } from '@angular/core';
import { Plan } from '../../../client/step-client-module';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';

@Pipe({
  name: 'planUrl',
})
export class PlanUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  transform(idOrPlan?: string | Plan): string {
    return this._commonEntitiesUrls.planEditorUrl(idOrPlan);
  }
}
