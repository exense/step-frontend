import { Params } from '@angular/router';
import { NavigatorQueryParamsCleanupService } from '@exense/step-core';
import { Injectable } from '@angular/core';
import { TS_PARAMS_PREFIX } from './modules/_common';

/**
 * @Deprecated
 */
@Injectable()
export class TsNavigatorQueryParamsCleanupService implements NavigatorQueryParamsCleanupService {
  isCleanUpRequired(queryParams: Params): boolean {
    return Object.keys(queryParams).some((key) => key.startsWith(TS_PARAMS_PREFIX));
  }
  cleanup(queryParams: Params): Params {
    Object.keys(queryParams)
      .filter((key) => key.startsWith(TS_PARAMS_PREFIX))
      .forEach((key) => delete queryParams[key]);
    return queryParams;
  }
}
