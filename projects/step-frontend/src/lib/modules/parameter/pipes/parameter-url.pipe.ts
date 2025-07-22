import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService, Parameter } from '@exense/step-core';

@Pipe({
  name: 'parameterUrl',
  standalone: false,
})
export class ParameterUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  transform(idOrParameter?: string | Parameter): string {
    return this._commonEntitiesUrls.parameterEditorUrl(idOrParameter);
  }
}
