import { FilterCondition } from './filter-condition';
import { FilterConditionType } from './filter-condition-type.enum';
import { TableRequestFilter } from '../../../client/table/shared/table-request-data';
import { BaseFilter } from '../../../client/table/shared/base-filter';
import { CompareCondition } from '../../basics/types/compare-condition.enum';
import { TableCollectionFilter } from '../../../client/table/shared/table-collection-filter';

export class BooleanArrayFilterCondition extends FilterCondition<(boolean | string)[]> {
  readonly filterConditionType = FilterConditionType.BOOLEAN_ARRAY;

  constructor(source?: (boolean | string)[]) {
    super(source);
  }

  override isEmpty(): boolean {
    return !this.sourceObject?.length;
  }

  override toRequestFilterInternal(field: string): Array<TableRequestFilter | undefined> {
    const valueSet = new Set(this.sourceObject ?? []);
    const children: BaseFilter[] = [];

    if (valueSet.has(true) || valueSet.has('true')) {
      children.push({
        field,
        type: CompareCondition.EQUALS,
        expectedValue: 'true',
      });
    }

    if (valueSet.has(false) || valueSet.has('false')) {
      children.push(
        {
          field,
          type: CompareCondition.EQUALS,
          expectedValue: 'false',
        },
        {
          field,
          type: CompareCondition.EQUALS,
          expectedValue: null,
        },
      );
    }

    const result: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.OR,
        children,
      },
    };

    return children?.length > 0 ? [result] : [];
  }
}
