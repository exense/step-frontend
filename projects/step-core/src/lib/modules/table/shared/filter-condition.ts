import { TableRequestFilter } from '../../../client/step-client-module';
import { FilterConditionType } from './filter-condition-type.enum';
import { FilterConditionJson } from './filter-condition-json.interface';
import { RequestFilterInterceptor } from './request-filter-interceptor';

export abstract class FilterCondition<T = any> implements FilterConditionJson<T> {
  private requestFilterInterceptors?: RequestFilterInterceptor[] | null;

  constructor(readonly sourceObject?: T) {}

  abstract toRequestFilterInternal(field: string): Array<TableRequestFilter | undefined>;
  abstract isEmpty(): boolean;

  abstract filterConditionType: FilterConditionType;

  getSearchValue(): unknown {
    return this.sourceObject;
  }

  toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    const requestFilter = this.toRequestFilterInternal(field);
    if (!this.requestFilterInterceptors?.length) {
      return requestFilter;
    }

    return this.requestFilterInterceptors.reduce((filter, interceptor) => {
      return interceptor.intercept(this.filterConditionType, filter);
    }, requestFilter);
  }

  toJSON(): FilterConditionJson {
    const filterConditionType = this.filterConditionType;
    const sourceObject = this.sourceObject;
    return { filterConditionType, sourceObject };
  }

  assignRequestFilterInterceptors(interceptors?: RequestFilterInterceptor[] | null) {
    this.requestFilterInterceptors = interceptors;
  }
}
