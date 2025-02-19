import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { ExecutiontTaskParameters } from '../../../client/step-client-module';

@Pipe({
  name: 'taskCrossExecutionUrl',
  standalone: true,
})
export class TaskCrossExecutionUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  transform(idOrTask?: string | ExecutiontTaskParameters): string {
    return this._commonEntitiesUrls.schedulerCrossExecutionUrl(idOrTask);
  }
}
