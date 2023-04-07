import { FilterCondition } from './filter-condition';
import { TableRequestFilter } from '../../../client/step-client-module';
import { CompareCondition } from '../../basics/shared/compare-condition.enum';

export class ScopeFilterCondition extends FilterCondition {
  constructor(private searchValue?: string) {
    super();
  }

  toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
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
