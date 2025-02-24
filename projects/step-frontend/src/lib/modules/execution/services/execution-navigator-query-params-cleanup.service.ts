import { inject, Injectable } from '@angular/core';
import { NavigatorQueryParamsCleanupService } from '@exense/step-core';
import { Params } from '@angular/router';
import { REPORT_NODE_DETAILS_QUERY_PARAMS } from './report-node-details-query-params.token';

@Injectable()
export class ExecutionNavigatorQueryParamsCleanupService implements NavigatorQueryParamsCleanupService {
  private _queryParamNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);
  private keysToCleanup = new Set(Object.values(this._queryParamNames) as string[]);

  isCleanUpRequired(queryParams: Params): boolean {
    return Object.keys(queryParams).some((key) => this.keysToCleanup.has(key));
  }

  cleanup(queryParams: Params): Params {
    Object.keys(queryParams)
      .filter((key) => this.keysToCleanup.has(key))
      .forEach((key) => delete queryParams[key]);
    return queryParams;
  }
}
