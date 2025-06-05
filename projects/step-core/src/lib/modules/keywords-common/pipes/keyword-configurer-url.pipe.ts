import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { Keyword } from '../../../client/step-client-module';

@Pipe({
  name: 'keywordConfigurerUrl',
  standalone: false,
})
export class KeywordConfigurerUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  transform(idOrKeyword?: string | Keyword): string {
    return this._commonEntitiesUrls.keywordConfigurerUrl(idOrKeyword);
  }
}
