import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEditorUrlsService, Parameter } from '@exense/step-core';

@Pipe({
  name: 'parameterUrl',
})
export class ParameterUrlPipe implements PipeTransform {
  private _commonEditorUrls = inject(CommonEditorUrlsService);

  transform(idOrParameter?: string | Parameter): string {
    return this._commonEditorUrls.parameterEditorUrl(idOrParameter);
  }
}
