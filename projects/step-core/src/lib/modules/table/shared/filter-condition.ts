import { TableRequestFilter } from '../../../client/step-client-module';
import { FilterConditionType } from './filter-condition-type.enum';
import { FilterConditionJson } from './filter-condition-json.interface';

export abstract class FilterCondition<T = any> implements FilterConditionJson<T> {
  constructor(readonly sourceObject?: T) {}
  abstract toRequestFilter(field: string): Array<TableRequestFilter | undefined>;
  abstract isEmpty(): boolean;

  abstract filterConditionType: FilterConditionType;

  toJSON(): FilterConditionJson {
    const filterConditionType = this.filterConditionType;
    const sourceObject = this.sourceObject;
    return { filterConditionType, sourceObject };
  }
}
