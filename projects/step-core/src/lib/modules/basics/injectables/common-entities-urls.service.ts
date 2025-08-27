import { Injectable } from '@angular/core';
import {
  Execution,
  ExecutiontTaskParameters,
  Keyword,
  Parameter,
  Plan,
  Resource,
  DashboardView,
} from '../../../client/step-client-module';

const REGEXP_EXECUTION_URL = /\/(?:executions|legacy-executions)\/(?:open\/)?(?:\d|\w){24}/;
const REGEXP_DASHBOARD_URL = /\/dashboards\/(?:\d|\w){24}/;

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

  planListUrl(): string {
    return '/plans/list';
  }

  isMatchPlanEditorUrl(url: string): boolean {
    return url.includes(`/plans/editor`);
  }

  keywordConfigurerUrl(idOrKeyword?: string | Keyword): string {
    if (!idOrKeyword) {
      return '';
    }
    const id = typeof idOrKeyword === 'string' ? idOrKeyword : idOrKeyword.id;
    return `/functions/configure/${id}`;
  }

  keywordCompositeEditorUrl(idOrKeyword?: string | Keyword): string {
    if (!idOrKeyword) {
      return '';
    }
    const id = typeof idOrKeyword === 'string' ? idOrKeyword : idOrKeyword.id;
    return `/composites/editor/${id}`;
  }

  keywordListUrl(): string {
    return '/functions';
  }

  isMatchKeywordConfigurerUrl(url: string): boolean {
    return url.includes('/functions/configure');
  }

  isMatchKeywordCompositesUrl(url: string): boolean {
    return url.includes('/composites/editor');
  }

  parameterEditorUrl(idOrParameter?: string | Parameter): string {
    if (!idOrParameter) {
      return '';
    }
    const id = typeof idOrParameter === 'string' ? idOrParameter : idOrParameter.id;
    return `/parameters/editor/${id}`;
  }

  parametersListUrl(): string {
    return '/parameters';
  }

  isMatchParameterEditorUrl(url: string): boolean {
    return url.includes('/parameters/editor');
  }

  resourceEditorUrl(idOrResource?: string | Resource): string {
    if (!idOrResource) {
      return '';
    }
    const id = typeof idOrResource === 'string' ? idOrResource : idOrResource.id;
    return `/resources/editor/${id}`;
  }

  resourceListUrl(): string {
    return '/resources';
  }

  isMatchResourceEditorUrl(url: string): boolean {
    return url.includes('/resources/editor');
  }

  schedulerTaskEditorUrl(idOrTask?: string | ExecutiontTaskParameters): string {
    if (!idOrTask) {
      return '';
    }
    const id = typeof idOrTask === 'string' ? idOrTask : idOrTask.id;
    return `/scheduler/editor/${id}`;
  }

  schedulerListUrl(): string {
    return '/scheduler';
  }

  isMatchSchedulerTaskEditorUrl(url: string): boolean {
    return url.includes('/scheduler/editor');
  }

  schedulerPerformancePageUrl(idOrTask?: string | ExecutiontTaskParameters): string {
    if (!idOrTask) {
      return '';
    }
    const id = typeof idOrTask === 'string' ? idOrTask : idOrTask.id;
    return `/scheduler/${id}/performance`;
  }

  schedulerReportPageUrl(idOrTask?: string | ExecutiontTaskParameters): string {
    if (!idOrTask) {
      return '';
    }
    const id = typeof idOrTask === 'string' ? idOrTask : idOrTask.id;
    return `/scheduler/${id}/report`;
  }

  crossExecutionTaskPageUrl(idOrTask?: string | ExecutiontTaskParameters): string {
    if (!idOrTask) {
      return '';
    }
    const id = typeof idOrTask === 'string' ? idOrTask : idOrTask.id;
    return `/scheduler/${id}/report`;
  }

  crossExecutionPlanPageUrl(idOrPlan: string | Plan): string {
    if (!idOrPlan) {
      return '';
    }
    const id = typeof idOrPlan === 'string' ? idOrPlan : idOrPlan.id;
    return `/plan-view/${id}/report`;
  }

  executionList(): string {
    return '/executions/list';
  }

  legacyExecutionUrl(idOrExecution?: string | Execution, isDirectLink = true): string {
    if (!idOrExecution) {
      return '';
    }
    const id = typeof idOrExecution === 'string' ? idOrExecution : idOrExecution.id;
    // /executions/open/id route is required, when one execution is opened from another
    // for proper content rerender
    return isDirectLink ? `/legacy-executions/${id}` : `/legacy-executions/open/${id}`;
  }

  executionUrl(idOrExecution?: string | Execution, isDirectLink = true): string {
    if (!idOrExecution) {
      return '';
    }
    const id = typeof idOrExecution === 'string' ? idOrExecution : idOrExecution.id;
    // /executions/open/id route is required, when one execution is opened from another for proper content rerender
    return isDirectLink ? `/executions/${id}` : `/executions/open/${id}`;
  }

  isMatchExecutionUrl(url: string): boolean {
    return REGEXP_EXECUTION_URL.test(url);
  }

  dashboardUrl(idOrDashboardView?: string | DashboardView): string {
    if (!idOrDashboardView) {
      return '';
    }
    const id = typeof idOrDashboardView === 'string' ? idOrDashboardView : idOrDashboardView.id;
    return `/dashboards/${id}`;
  }

  isMatchDashboardUrl(url: string): boolean {
    return REGEXP_DASHBOARD_URL.test(url);
  }

  dashboardListUrl(): string {
    return `/dashboards`;
  }
}
