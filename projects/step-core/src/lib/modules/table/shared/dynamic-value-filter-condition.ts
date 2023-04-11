import { FilterCondition } from './filter-condition';
import { TableCollectionFilter, TableRequestFilter } from '../../../client/step-client-module';
import { CompareCondition } from '../../basics/step-basics.module';

export class DynamicValueFilterCondition extends FilterCondition {
  constructor(private searchValue?: string) {
    super();
  }

  toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.searchValue) {
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
                expression: this.searchValue,
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
                expression: this.searchValue,
                caseSensitive: false,
              },
            ],
          },
        ],
      },
    };

    return [filter];
  }
}
