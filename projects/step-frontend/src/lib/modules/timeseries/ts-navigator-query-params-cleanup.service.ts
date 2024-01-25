import { Params } from '@angular/router';
import { NavigatorQueryParamsCleanupService } from '@exense/step-core';
import { Injectable } from '@angular/core';
import { TsUtils } from './util/ts-utils';

@Injectable()
export class TsNavigatorQueryParamsCleanupService implements NavigatorQueryParamsCleanupService {
  isCleanUpRequired(queryParams: Params): boolean {
    return !!queryParams?.[TsUtils.TS_PARAMS_KEY];
  }
  cleanup(queryParams: Params): Params {
    const clear = (queryParams?.[TsUtils.TS_PARAMS_KEY] ?? '').split(',');
    clear.forEach((value: string) => delete queryParams[value]);
    delete queryParams[TsUtils.TS_PARAMS_KEY];
    return queryParams;
  }
}
