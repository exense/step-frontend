import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { ExecutiontTaskParameters } from '../../../client/step-client-module';

@Pipe({
  name: 'taskPerformancePageUrl',
  standalone: true,
})
export class TaskPerformancePageUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  transform(idOrTask?: string | ExecutiontTaskParameters): string {
    return this._commonEntitiesUrls.schedulerPerformancePageUrl(idOrTask);
  }
}
