import { Params } from '@angular/router';
import { NavigatorQueryParamsCleanupService } from '@exense/step-core';
import { Injectable } from '@angular/core';
import { TS_PARAMS_KEY } from './modules/_common';

@Injectable()
export class TsNavigatorQueryParamsCleanupService implements NavigatorQueryParamsCleanupService {
  isCleanUpRequired(queryParams: Params): boolean {
    return !!queryParams?.[TS_PARAMS_KEY];
  }
  cleanup(queryParams: Params): Params {
    const clear = (queryParams?.[TS_PARAMS_KEY] ?? '').split(',');
    clear.forEach((value: string) => delete queryParams[value]);
    delete queryParams[TS_PARAMS_KEY];
    return queryParams;
  }
}
