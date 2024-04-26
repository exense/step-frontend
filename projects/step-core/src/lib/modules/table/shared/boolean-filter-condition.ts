import { FilterCondition } from './filter-condition';
import { FilterConditionType } from './filter-condition-type.enum';
import { TableRequestFilter } from '../../../client/table/shared/table-request-data';
import { TableCollectionFilter } from '../../../client/table/shared/table-collection-filter';
import { CompareCondition } from '../../basics/types/compare-condition.enum';

export class BooleanFilterCondition extends FilterCondition<string> {
  readonly filterConditionType = FilterConditionType.BOOLEAN;

  constructor(searchValue?: string) {
    super(searchValue);
  }

  override isEmpty(): boolean {
    return !this.sourceObject;
  }

  override toRequestFilterInternal(field: string): Array<TableRequestFilter | undefined> {
    const value = (this.sourceObject || '').toLowerCase();
    if (value !== true.toString() && value !== false.toString()) {
      return [];
    }
    const expectedValue = value === true.toString();

    const boolFilter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.EQUALS,
        field,
        expectedValue,
      },
    };
    return [boolFilter];
  }
}
