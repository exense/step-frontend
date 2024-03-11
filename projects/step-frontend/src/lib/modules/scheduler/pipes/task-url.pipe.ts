import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService, ExecutiontTaskParameters } from '@exense/step-core';

@Pipe({
  name: 'taskUrl',
})
export class TaskUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  transform(idOrTask?: string | ExecutiontTaskParameters): string {
    return this._commonEntitiesUrls.schedulerTaskEditorUrl(idOrTask);
  }
}
