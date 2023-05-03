import { FilterCondition } from './filter-condition';
import { TableCollectionFilter, TableRequestFilter } from '../../../client/step-client-module';
import { CompareCondition } from '../../basics/step-basics.module';
import { FilterConditionType } from './filter-condition-type.enum';

export class DynamicValueFilterCondition extends FilterCondition<string> {
  readonly filterConditionType = FilterConditionType.DYNAMIC_VALUE;

  constructor(searchValue?: string) {
    super(searchValue);
  }

  toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.sourceObject) {
      return [];
    }

    const filter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.OR,
        children: [
          {
            type: CompareCondition.AND,
            children: [
              {
                type: CompareCondition.EQUALS,
                field: `${field}.dynamic`,
                expectedValue: false,
              },
              {
                type: CompareCondition.REGEX,
                field: `${field}.value`,
                expression: this.sourceObject,
                caseSensitive: false,
              },
            ],
          },
          {
            type: CompareCondition.AND,
            children: [
              {
                type: CompareCondition.EQUALS,
                field: `${field}.dynamic`,
                expectedValue: true,
              },
              {
                type: CompareCondition.REGEX,
                field: `${field}.expression`,
                expression: this.sourceObject,
                caseSensitive: false,
              },
            ],
          },
        ],
      },
    };

    return [filter];
  }

  override isEmpty(): boolean {
    return !this.sourceObject;
  }
}
