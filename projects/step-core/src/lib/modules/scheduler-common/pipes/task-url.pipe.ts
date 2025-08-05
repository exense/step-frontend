import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { ExecutiontTaskParameters } from '../../../client/step-client-module';
import { ScheduledTaskUrlService } from '../injectables/scheduled-task-url.service';

@Pipe({
  name: 'taskUrl',
})
export class TaskUrlPipe implements PipeTransform {
  private _scheduledTaskUrl = inject(ScheduledTaskUrlService, { optional: true });
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  transform(idOrTask?: string | ExecutiontTaskParameters): string {
    return !!this._scheduledTaskUrl
      ? this._scheduledTaskUrl.schedulerTaskUrl(idOrTask)
      : this._commonEntitiesUrls.schedulerTaskEditorUrl(idOrTask);
  }
}
