import { FilterCondition } from './filter-condition';
import { TableRequestFilter, TableCollectionFilter } from '../../../client/step-client-module';
import { CompareCondition } from '../../basics/types/compare-condition.enum';
import { FilterConditionType } from './filter-condition-type.enum';

export class NumberFilterCondition extends FilterCondition<string> {
  readonly filterConditionType = FilterConditionType.NUM;

  constructor(searchValue?: string) {
    super(searchValue);
  }

  override isEmpty(): boolean {
    return !this.sourceObject;
  }

  override toRequestFilterInternal(field: string): Array<TableRequestFilter | undefined> {
    const expectedValue = parseInt(this.sourceObject || '');
    if (isNaN(expectedValue)) {
      return [];
    }

    const numberFilter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.EQUALS,
        field,
        expectedValue,
      },
    };
    return [numberFilter];
  }
}
