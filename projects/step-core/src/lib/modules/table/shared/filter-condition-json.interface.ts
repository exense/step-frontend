import { FilterConditionType } from './filter-condition-type.enum';

export interface FilterConditionJson<T = any> {
  filterConditionType: FilterConditionType;
  sourceObject?: T;
}
