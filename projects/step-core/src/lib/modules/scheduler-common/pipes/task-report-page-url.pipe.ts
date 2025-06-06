import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { ExecutiontTaskParameters } from '../../../client/step-client-module';

@Pipe({
  name: 'taskReportPageUrl',
  standalone: true,
})
export class TaskReportPageUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  transform(idOrTask?: string | ExecutiontTaskParameters): string {
    return this._commonEntitiesUrls.schedulerReportPageUrl(idOrTask);
  }
}
