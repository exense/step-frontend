import { NavigatorQueryParamsCleanupService } from '../../basics/step-basics.module';
import { Params } from '@angular/router';
import { TABLE_QUERY_PREFIX } from './table-persistence-url-state.service';
import { Injectable } from '@angular/core';

@Injectable()
export class TableNavigatorQueryParamsCleanupService implements NavigatorQueryParamsCleanupService {
  isCleanUpRequired(queryParams: Params): boolean {
    return Object.keys(queryParams).some((key) => key.startsWith(TABLE_QUERY_PREFIX));
  }

  cleanup(queryParams: Params): Params {
    Object.keys(queryParams)
      .filter((key) => key.startsWith(TABLE_QUERY_PREFIX))
      .forEach((key) => delete queryParams[key]);
    return queryParams;
  }
}
