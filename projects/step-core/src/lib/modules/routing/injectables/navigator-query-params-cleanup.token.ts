import { InjectionToken } from '@angular/core';
import { NavigatorQueryParamsCleanupService } from './navigator-query-params-cleanup.service';

export const NAVIGATOR_QUERY_PARAMS_CLEANUP = new InjectionToken<NavigatorQueryParamsCleanupService[]>(
  'Query params cleanup logic',
);
