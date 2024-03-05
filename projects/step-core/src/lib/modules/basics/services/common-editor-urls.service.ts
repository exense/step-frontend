import { Injectable } from '@angular/core';
import { Plan } from '../../../client/generated';

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
}
