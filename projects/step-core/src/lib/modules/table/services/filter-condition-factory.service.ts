import { inject, Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { REPOSITORY_PARAMETERS } from '../../repository-parameters';
import { FilterCondition } from '../shared/filter-condition';
import { SingleDateFilterCondition } from '../shared/single-date-filter-condition';
import { ScopeFilterCondition } from '../shared/scope-filter-condition';
import { ReportNodeFilterCondition } from '../shared/report-node-filter-condition';
import { NumberFilterCondition } from '../shared/number-filter-condition';
import { BasicFilterCondition } from '../shared/basic-filter-condition';
import { TableRequestFilter } from '../../../client/step-client-module';
import { DynamicValueFilterCondition } from '../shared/dynamic-value-filter-condition';
import { ParametersFilterCondition } from '../shared/parameters-filter-condition';
import { FilterConditionJson } from '../shared/filter-condition-json.interface';
import { FilterConditionType } from '../shared/filter-condition-type.enum';
import { BooleanFilterCondition } from '../shared/boolean-filter-condition';
import { DateRangeFilterCondition } from '../shared/date-range-filter-condition';
import { DateRange } from '../../date-picker/date-picker.module';
import { ArrayFilterCondition } from '../shared/array-filter-condition';
import { REQUEST_FILTERS_INTERCEPTORS } from './request-filter-interceptors.token';
import { BooleanArrayFilterCondition } from '../shared/boolean-array-filter-condition';
import { InFilterCondition } from '../shared/in-filter-condition';

@Injectable({
  providedIn: 'root',
})
export class FilterConditionFactoryService {
  private _parameters = inject(REPOSITORY_PARAMETERS);
  private _interceptors = inject(REQUEST_FILTERS_INTERCEPTORS, { optional: true });

  basicFilterCondition(filters: TableRequestFilter[]): FilterCondition {
    return this.configureCondition(new BasicFilterCondition(filters));
  }

  singleDateFilterCondition(date?: DateTime): FilterCondition {
    return this.configureCondition(new SingleDateFilterCondition(date));
  }

  dateRangeFilterCondition(range?: DateRange, columnsOverride?: { start?: string; end?: string }): FilterCondition {
    return this.configureCondition(new DateRangeFilterCondition({ range, columnsOverride }));
  }

  arrayFilterCondition(items?: string[]): FilterCondition {
    return this.configureCondition(new ArrayFilterCondition(items));
  }

  booleanArrayFilterCondition(items?: (string | boolean)[]): FilterCondition {
    return this.configureCondition(new BooleanArrayFilterCondition(items));
  }

  inFilterCondition(items?: string[]): FilterCondition {
    return this.configureCondition(new InFilterCondition(items));
  }

  scopeFilterCondition(value?: string): FilterCondition {
    return this.configureCondition(new ScopeFilterCondition(value));
  }

  reportNodeFilterCondition(value?: string, attributes?: string[]): FilterCondition {
    return this.configureCondition(new ReportNodeFilterCondition(value, attributes));
  }

  numberFilterCondition(value?: string): FilterCondition {
    return this.configureCondition(new NumberFilterCondition(value));
  }

  booleanFilterCondition(value?: string): FilterCondition {
    return this.configureCondition(new BooleanFilterCondition(value));
  }

  dynamicValueFilterCondition(value?: string): FilterCondition {
    return this.configureCondition(new DynamicValueFilterCondition(value));
  }

  parametersFilterCondition(value?: string): FilterCondition {
    return this.configureCondition(new ParametersFilterCondition(this._parameters, value));
  }

  create(filterCondition?: FilterConditionJson): FilterCondition | undefined {
    switch (filterCondition?.filterConditionType) {
      case FilterConditionType.BASIC:
        return this.basicFilterCondition(filterCondition?.sourceObject);
      case FilterConditionType.DYNAMIC_VALUE:
        return this.dynamicValueFilterCondition(filterCondition?.sourceObject);
      case FilterConditionType.NUM:
        return this.numberFilterCondition(filterCondition?.sourceObject);
      case FilterConditionType.PARAMETERS:
        return this.parametersFilterCondition(filterCondition?.sourceObject?.searchValue);
      case FilterConditionType.REPORT_NODE:
        return this.reportNodeFilterCondition(
          filterCondition?.sourceObject?.searchValue,
          filterCondition?.sourceObject?.attributeValues,
        );
      case FilterConditionType.SCOPE:
        return this.scopeFilterCondition(filterCondition?.sourceObject);
      case FilterConditionType.SINGLE_DATE:
        return this.singleDateFilterCondition(filterCondition?.sourceObject);
      case FilterConditionType.DATE_RANGE:
        return this.dateRangeFilterCondition(
          filterCondition?.sourceObject?.range,
          filterCondition?.sourceObject?.columnsOverride,
        );
      case FilterConditionType.ARRAY:
        return this.arrayFilterCondition(filterCondition?.sourceObject);
      case FilterConditionType.BOOLEAN:
        return this.booleanFilterCondition(filterCondition?.sourceObject);
      case FilterConditionType.BOOLEAN_ARRAY:
        return this.booleanArrayFilterCondition(filterCondition?.sourceObject);
      case FilterConditionType.IN:
        return this.inFilterCondition(filterCondition?.sourceObject);
      default:
        return undefined;
    }
  }

  private configureCondition(filterCondition: FilterCondition): FilterCondition {
    filterCondition.assignRequestFilterInterceptors(this._interceptors);
    return filterCondition;
  }
}
