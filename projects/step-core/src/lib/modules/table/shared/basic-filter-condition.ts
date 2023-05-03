import { FilterCondition } from './filter-condition';
import { TableRequestFilter } from '../../../client/step-client-module';
import { FilterConditionType } from './filter-condition-type.enum';

export class BasicFilterCondition extends FilterCondition<{ filters?: TableRequestFilter[] }> {
  readonly filterConditionType = FilterConditionType.BASIC;

  constructor(filters?: TableRequestFilter[]) {
    super({ filters });
  }
  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    return this.sourceObject?.filters || [];
  }

  override isEmpty(): boolean {
    return !!this.sourceObject?.filters?.length;
  }
}
