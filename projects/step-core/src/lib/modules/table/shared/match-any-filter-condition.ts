import { CompareCondition } from '../../basics/step-basics.module';
import { TableRequestFilter } from '../../../client/step-client-module';
import { FilterCondition } from './filter-condition';
import { FilterConditionType } from './filter-condition-type.enum';

export class MatchAnyFilterCondition extends FilterCondition<Record<string, string>> {
  filterConditionType: FilterConditionType = FilterConditionType.ARRAY;

  constructor(fieldValues?: Record<string, string>) {
    super(fieldValues);
  }
  override isEmpty(): boolean {
    return !this.sourceObject || Object.keys(this.sourceObject).length === 0;
  }
  override toRequestFilterInternal(_: string): Array<TableRequestFilter | undefined> {
    if (!this.sourceObject) return [];
    const children = Object.entries(this.sourceObject).map(([field, expectedValue]) => ({
      field,
      type: CompareCondition.EQUALS,
      expectedValue,
    }));
    return [{ collectionFilter: { type: CompareCondition.OR, children } }];
  }
}
