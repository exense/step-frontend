import { inject, Pipe, PipeTransform } from '@angular/core';
import { Plan } from '../client/step-client-module';
import { CommonEditorUrlsService } from '../modules/basics/services/common-editor-urls.service';

@Pipe({
  name: 'planUrl',
})
export class PlanUrlPipe implements PipeTransform {
  private _commonEditorUrls = inject(CommonEditorUrlsService);

  transform(idOrPlan?: string | Plan): string {
    return this._commonEditorUrls.planEditorUrl(idOrPlan);
  }
}
