import { inject, Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { REPOSITORY_PARAMETERS } from '../../basics/step-basics.module';
import { FilterCondition } from '../shared/filter-condition';
import { SingleDateFilterCondition } from '../shared/single-date-filter-condition';
import { ScopeFilterCondition } from '../shared/scope-filter-condition';
import { ReportNodeFilterCondition } from '../shared/report-node-filter-condition';
import { NumberFilterCondition } from '../shared/number-filter-condition';
import { BasicFilterCondition } from '../shared/basic-filter-condition';
import { TableRequestFilter } from '../../../client/step-client-module';
import { DynamicValueFilterCondition } from '../shared/dynamic-value-filter-condition';
import { ParametersFilterCondition } from '../shared/parameters-filter-condition';

@Injectable({
  providedIn: 'root',
})
export class FilterConditionFactoryService {
  private _parameters = inject(REPOSITORY_PARAMETERS);

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

  parametersFilterCondition(value?: string): FilterCondition {
    return new ParametersFilterCondition(this._parameters, value);
  }
}
