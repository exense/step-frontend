import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEditorUrlsService } from '../../basics/step-basics.module';
import { Keyword } from '../../../client/step-client-module';

@Pipe({
  name: 'keywordConfigurerUrl',
})
export class KeywordConfigurerUrlPipe implements PipeTransform {
  private _commonEditorUrls = inject(CommonEditorUrlsService);

  transform(idOrKeyword?: string | Keyword): string {
    return this._commonEditorUrls.keywordConfigurerUrl(idOrKeyword);
  }
}
