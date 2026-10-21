import { Params } from '@angular/router';

export const QUERY_PARAMS_CLEANUP_NAVIGATION = Symbol('Query parameters cleanup navigation');

export abstract class NavigatorQueryParamsCleanupService {
  abstract isCleanUpRequired(queryParams: Params): boolean;
  abstract cleanup(queryParams: Params): Params;
}
