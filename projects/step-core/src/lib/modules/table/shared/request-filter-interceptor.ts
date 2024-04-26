import { FilterConditionType } from './filter-condition-type.enum';
import { TableRequestFilter } from '../../../client/table/shared/table-request-data';

export abstract class RequestFilterInterceptor {
  abstract intercept(
    filterConditionType: FilterConditionType,
    requestFilters: (TableRequestFilter | undefined)[],
  ): (TableRequestFilter | undefined)[];
}
