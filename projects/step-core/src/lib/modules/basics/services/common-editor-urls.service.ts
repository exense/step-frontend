import { Injectable } from '@angular/core';
import { Keyword, Parameter, Plan } from '../../../client/step-client-module';

@Injectable({
  providedIn: 'root',
})
export class CommonEditorUrlsService {
  planEditorUrl(idOrPlan?: string | Plan): string {
    if (!idOrPlan) {
      return '';
    }
    const id = typeof idOrPlan === 'string' ? idOrPlan : idOrPlan.id;
    return `/plans/editor/${id}`;
  }

  keywordConfigurerUrl(idOrKeyword?: string | Keyword): string {
    if (!idOrKeyword) {
      return '';
    }
    const id = typeof idOrKeyword === 'string' ? idOrKeyword : idOrKeyword.id;
    return `/functions/configure/${id}`;
  }

  parameterEditorUrl(idOrParameter?: string | Parameter): string {
    if (!idOrParameter) {
      return '';
    }
    const id = typeof idOrParameter === 'string' ? idOrParameter : idOrParameter.id;
    return `/parameters/editor/${id}`;
  }
}
