import { FilterCondition } from './filter-condition';
import { TableRequestFilter } from '../../../client/step-client-module';
import { CompareCondition } from '../../basics/shared/compare-condition.enum';
import { FilterConditionType } from './filter-condition-type.enum';

export class ScopeFilterCondition extends FilterCondition<string> {
  readonly filterConditionType = FilterConditionType.SCOPE;

  constructor(searchValue?: string) {
    super(searchValue);
  }

  override isEmpty(): boolean {
    return !this.sourceObject;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.sourceObject) {
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
              expression: this.sourceObject,
              caseSensitive: false,
            },
            {
              type: CompareCondition.REGEX,
              field: 'scopeEntity',
              expression: this.sourceObject,
              caseSensitive: false,
            },
          ],
        },
      },
    ];
  }
}
