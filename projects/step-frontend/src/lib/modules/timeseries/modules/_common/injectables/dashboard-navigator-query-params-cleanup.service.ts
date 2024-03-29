import { Injectable } from '@angular/core';
import { NavigatorQueryParamsCleanupService } from '@exense/step-core';
import { Params } from '@angular/router';
import { TS_PARAMS_PREFIX } from './chart-url-params.service';
import { TimeSeriesConfig } from '../types/time-series/time-series.config';

@Injectable()
export class DashboardNavigatorQueryParamsCleanupService implements NavigatorQueryParamsCleanupService {
  isCleanUpRequired(queryParams: Params): boolean {
    return Object.keys(queryParams).some((key) => key.startsWith(TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX));
  }
  cleanup(queryParams: Params): Params {
    Object.keys(queryParams)
      .filter((key) => key.startsWith(TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX))
      .forEach((key) => delete queryParams[key]);
    return queryParams;
  }
}
