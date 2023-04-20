import { FilterCondition } from './filter-condition';
import { TableRequestFilter, TableCollectionFilter } from '../../../client/step-client-module';
import { CompareCondition } from '../../basics/shared/compare-condition.enum';

export class NumberFilterCondition extends FilterCondition {
  constructor(private searchValue?: string) {
    super();
  }

  override isEmpty(): boolean {
    return !this.searchValue;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    const expectedValue = parseInt(this.searchValue || '');
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
