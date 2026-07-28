import { CompareCondition } from '../../basics/step-basics.module';
import { Includes, TableRequestFilter } from '../../../client/step-client-module';
import { FilterCondition } from './filter-condition';
import { FilterConditionType } from './filter-condition-type.enum';

export class IncludesFilterCondition extends FilterCondition<string> {
  readonly filterConditionType = FilterConditionType.INCLUDES;

  constructor(source?: string) {
    super(source);
  }

  override isEmpty(): boolean {
    return !this.sourceObject;
  }

  override toRequestFilterInternal(field: string): Array<TableRequestFilter | undefined> {
    if (!this.sourceObject) {
      return [];
    }

    const includesFilter: Includes = {
      field,
      type: CompareCondition.INCLUDES,
      expectedValue: this.sourceObject,
    };

    return [{ collectionFilter: includesFilter }];
  }
}
