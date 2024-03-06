import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEditorUrlsService, Resource } from '@exense/step-core';

@Pipe({
  name: 'resourceUrl',
})
export class ResourceUrlPipe implements PipeTransform {
  private _commonEditorsUrls = inject(CommonEditorUrlsService);

  transform(idOrResource?: string | Resource): string {
    return this._commonEditorsUrls.resourceEditorUrl(idOrResource);
  }
}
