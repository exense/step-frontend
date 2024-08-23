import { Injectable } from '@angular/core';
import {
  Execution,
  ExecutiontTaskParameters,
  Keyword,
  Parameter,
  Plan,
  Resource,
} from '../../../client/step-client-module';

@Injectable({
  providedIn: 'root',
})
export class CommonEntitiesUrlsService {
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

  resourceEditorUrl(idOrResource?: string | Resource): string {
    if (!idOrResource) {
      return '';
    }
    const id = typeof idOrResource === 'string' ? idOrResource : idOrResource.id;
    return `/resources/editor/${id}`;
  }

  schedulerTaskEditorUrl(idOrTask?: string | ExecutiontTaskParameters): string {
    if (!idOrTask) {
      return '';
    }
    const id = typeof idOrTask === 'string' ? idOrTask : idOrTask.id;
    return `/scheduler/editor/${id}`;
  }

  executionUrl(idOrExecution?: string | Execution, isDirectLink = true): string {
    if (!idOrExecution) {
      return '';
    }
    const id = typeof idOrExecution === 'string' ? idOrExecution : idOrExecution.id;
    // /executions/open/id route is required, when one execution is opened from another
    // for proper content rerender
    return isDirectLink ? `/executions/${id}` : `/executions/open/${id}`;
  }

  altExecutionUrl(idOrExecution?: string | Execution): string {
    if (!idOrExecution) {
      return '';
    }
    const id = typeof idOrExecution === 'string' ? idOrExecution : idOrExecution.id;
    // /executions/open/id route is required, when one execution is opened from another
    // for proper content rerender
    return `/alt-executions/${id}`;
  }
}
