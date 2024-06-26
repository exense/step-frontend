import { FilterCondition } from './filter-condition';
import { TableRequestFilter } from '../../../client/step-client-module';
import { FilterConditionType } from './filter-condition-type.enum';

export class BasicFilterCondition extends FilterCondition<TableRequestFilter[] | undefined> {
  readonly filterConditionType = FilterConditionType.BASIC;

  constructor(filters?: TableRequestFilter[]) {
    super(filters);
  }
  override toRequestFilterInternal(field: string): Array<TableRequestFilter | undefined> {
    return this.sourceObject || [];
  }

  override isEmpty(): boolean {
    return !this.sourceObject?.length;
  }
}
