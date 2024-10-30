import { Injectable } from '@angular/core';
import {
  RequestFilterInterceptor,
  TableRequestFilter,
  FilterConditionType,
  TableCollectionFilter,
  Equals,
} from '@exense/step-core';
import { Status } from '../../_common/step-common.module';

const FIELD_STATUS = 'status';
const FIELD_RESULT = 'result';

const STATUS_FIELD_MAP = {
  [Status.INITIALIZING]: FIELD_STATUS,
  [Status.IMPORTING]: FIELD_STATUS,
  [Status.RUNNING]: FIELD_STATUS,
  [Status.ABORTING]: FIELD_STATUS,
  [Status.EXPORTING]: FIELD_STATUS,
  [Status.PROVISIONING]: FIELD_STATUS,
  [Status.DEPROVISIONING]: FIELD_STATUS,

  [Status.FAILED]: FIELD_RESULT,
  [Status.TECHNICAL_ERROR]: FIELD_RESULT,
  [Status.PASSED]: FIELD_RESULT,
  [Status.INTERRUPTED]: FIELD_RESULT,
  [Status.SKIPPED]: FIELD_RESULT,
  [Status.IMPORT_ERROR]: FIELD_RESULT,
};

type FieldValue = keyof typeof STATUS_FIELD_MAP;

@Injectable()
export class ExecutionListFilterInterceptorService implements RequestFilterInterceptor {
  intercept(filterConditionType: FilterConditionType, requestFilters: TableRequestFilter[]): TableRequestFilter[] {
    if (filterConditionType === FilterConditionType.ARRAY && requestFilters.length > 0) {
      return this.proceedArray(requestFilters);
    }
    return requestFilters;
  }

  private proceedArray(requestFilters: TableRequestFilter[]): TableRequestFilter[] {
    const tableCollectionFilter = requestFilters[0] as TableCollectionFilter;
    if (!tableCollectionFilter.collectionFilter?.children?.length) {
      return requestFilters;
    }

    tableCollectionFilter.collectionFilter.children = tableCollectionFilter.collectionFilter.children.map(
      (filter: Equals) => {
        if (filter.field !== FIELD_STATUS) {
          return filter;
        }

        const newFiled = STATUS_FIELD_MAP[filter.expectedValue as FieldValue] ?? filter.field;
        return { ...filter, field: newFiled };
      },
    );

    return requestFilters;
  }
}
