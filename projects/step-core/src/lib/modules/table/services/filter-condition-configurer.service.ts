import { FilterCondition } from '../shared/filter-condition';

export abstract class FilterConditionConfigurerService {
  abstract configure(filterCondition: FilterCondition): FilterCondition;
}
