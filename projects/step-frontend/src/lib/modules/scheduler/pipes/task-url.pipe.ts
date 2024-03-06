import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEditorUrlsService, ExecutiontTaskParameters } from '@exense/step-core';

@Pipe({
  name: 'taskUrl',
})
export class TaskUrlPipe implements PipeTransform {
  private _commonEditorUrls = inject(CommonEditorUrlsService);

  transform(idOrTask?: string | ExecutiontTaskParameters): string {
    return this._commonEditorUrls.schedulerTaskEditorUrl(idOrTask);
  }
}
