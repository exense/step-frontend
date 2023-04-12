import { FilterCondition } from './filter-condition';
import { TableRequestFilter } from '../../../client/table/models/table-request-data';
import { CompareCondition } from '../../basics/shared/compare-condition.enum';

export class ScopeFilterCondition extends FilterCondition {
  constructor(private searchValue?: string) {
    super();
  }

  override isEmpty(): boolean {
    return !this.searchValue;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.searchValue) {
      return [];
    }

    return [
      {
        collectionFilter: {
          type: CompareCondition.OR,
          children: [
            {
              type: CompareCondition.REGEX,
              field: 'scope',
              expression: this.searchValue,
              caseSensitive: false,
            },
            {
              type: CompareCondition.REGEX,
              field: 'scopeEntity',
              expression: this.searchValue,
              caseSensitive: false,
            },
          ],
        },
      },
    ];
  }
}
