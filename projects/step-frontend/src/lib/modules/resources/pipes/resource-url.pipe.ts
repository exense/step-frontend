import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService, Resource } from '@exense/step-core';

@Pipe({
  name: 'resourceUrl',
  standalone: false,
})
export class ResourceUrlPipe implements PipeTransform {
  private _commonEntitiesUrlss = inject(CommonEntitiesUrlsService);

  transform(idOrResource?: string | Resource): string {
    return this._commonEntitiesUrlss.resourceEditorUrl(idOrResource);
  }
}
