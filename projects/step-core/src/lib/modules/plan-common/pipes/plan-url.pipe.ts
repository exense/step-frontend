import { inject, Pipe, PipeTransform } from '@angular/core';
import { Plan } from '../../../client/step-client-module';
import { CommonEditorUrlsService } from '../../basics/step-basics.module';

@Pipe({
  name: 'planUrl',
  standalone: true,
})
export class PlanUrlPipe implements PipeTransform {
  private _commonEditorUrls = inject(CommonEditorUrlsService);

  transform(idOrPlan?: string | Plan): string {
    return this._commonEditorUrls.planEditorUrl(idOrPlan);
  }
}
