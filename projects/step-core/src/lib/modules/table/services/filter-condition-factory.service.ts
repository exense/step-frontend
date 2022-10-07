import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { FilterCondition } from '../shared/filter-condition';
import { SingleDateFilterCondition } from '../shared/single-date-filter-condition';
import { ScopeFilterCondition } from '../shared/scope-filter-condition';
import { ReportNodeFilterCondition } from '../shared/report-node-filter-condition';

@Injectable({
  providedIn: 'root',
})
export class FilterConditionFactoryService {
  singleDateFilterCondition(date?: DateTime): FilterCondition {
    return new SingleDateFilterCondition(date);
  }

  scopeFilterCondition(value?: string): FilterCondition {
    return new ScopeFilterCondition(value);
  }

  reportNodeFilterCondition(value?: string, attributes?: string[]): FilterCondition {
    return new ReportNodeFilterCondition(value, attributes);
  }
}
