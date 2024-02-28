import { Params } from '@angular/router';

export abstract class NavigatorQueryParamsCleanupService {
  abstract isCleanUpRequired(queryParams: Params): boolean;
  abstract cleanup(queryParams: Params): Params;
}
