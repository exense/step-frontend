import { FilterCondition } from './filter-condition';
import { TableRequestFilter, TableCollectionFilter } from '../../../client/step-client-module';
import { CompareCondition } from '../../basics/shared/compare-condition.enum';
import { FilterConditionType } from './filter-condition-type.enum';

export class NumberFilterCondition extends FilterCondition<string> {
  readonly filterConditionType = FilterConditionType.NUM;

  constructor(searchValue?: string) {
    super(searchValue);
  }

  override isEmpty(): boolean {
    return !this.sourceObject;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
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
