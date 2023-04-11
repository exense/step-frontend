import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { FilterCondition } from '../shared/filter-condition';
import { SingleDateFilterCondition } from '../shared/single-date-filter-condition';
import { ScopeFilterCondition } from '../shared/scope-filter-condition';
import { ReportNodeFilterCondition } from '../shared/report-node-filter-condition';
import { NumberFilterCondition } from '../shared/number-filter-condition';
import { BasicFilterCondition } from '../shared/basic-filter-condition';
import { TableRequestFilter } from '../../../client/step-client-module';
import { DynamicValueFilterCondition } from '../shared/dynamic-value-filter-condition';

@Injectable({
  providedIn: 'root',
})
export class FilterConditionFactoryService {
  basicFilterCondition(filters: TableRequestFilter[]): FilterCondition {
    return new BasicFilterCondition(filters);
  }

  singleDateFilterCondition(date?: DateTime): FilterCondition {
    return new SingleDateFilterCondition(date);
  }

  scopeFilterCondition(value?: string): FilterCondition {
    return new ScopeFilterCondition(value);
  }

  reportNodeFilterCondition(value?: string, attributes?: string[]): FilterCondition {
    return new ReportNodeFilterCondition(value, attributes);
  }

  numberFilterCondition(value?: string): FilterCondition {
    return new NumberFilterCondition(value);
  }

  dynamicValueFilterCondition(value?: string): FilterCondition {
    return new DynamicValueFilterCondition(value);
  }
}
