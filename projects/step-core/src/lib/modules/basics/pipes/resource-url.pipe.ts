import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../injectables/common-entities-urls.service';
import { Resource } from '../../../client/generated';

@Pipe({
  name: 'resourceUrl',
})
export class ResourceUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  transform(idOrResource?: string | Resource): string {
    return this._commonEntitiesUrls.resourceEditorUrl(idOrResource);
  }
}
