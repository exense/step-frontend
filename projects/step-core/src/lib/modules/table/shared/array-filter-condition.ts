import { CompareCondition } from '../../basics/step-basics.module';
import { TableCollectionFilter, TableRequestFilter } from '../../../client/step-client-module';
import { FilterCondition } from './filter-condition';
import { FilterConditionType } from './filter-condition-type.enum';

export class ArrayFilterCondition extends FilterCondition<Array<string>> {
  readonly filterConditionType = FilterConditionType.ARRAY;

  constructor(searchValue?: Array<string>) {
    super(searchValue);
  }

  override isEmpty(): boolean {
    return !this.sourceObject;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    const valueArray = this.sourceObject || [];

    const children = valueArray.map((value) => ({
      field,
      type: CompareCondition.EQUALS,
      expectedValue: value,
    }));

    const arrayFilter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.OR,
        children,
      },
    };

    return children?.length > 0 ? [arrayFilter] : [];
  }
}
