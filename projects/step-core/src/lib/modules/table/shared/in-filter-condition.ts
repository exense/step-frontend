import { CompareCondition } from '../../basics/step-basics.module';
import { TableCollectionFilter, TableRequestFilter } from '../../../client/step-client-module';
import { FilterCondition } from './filter-condition';
import { FilterConditionType } from './filter-condition-type.enum';

export class InFilterCondition extends FilterCondition<string[]> {
  readonly filterConditionType = FilterConditionType.IN;

  constructor(source?: string[]) {
    super(source);
  }

  override isEmpty(): boolean {
    return !this.sourceObject?.length;
  }

  override toRequestFilterInternal(field: string): Array<TableRequestFilter | undefined> {
    const valueArray = this.sourceObject ?? [];

    if (valueArray.length === 0) {
      return [];
    }

    const inFilter: TableCollectionFilter = {
      collectionFilter: {
        field,
        type: CompareCondition.IN,
        values: valueArray,
      } as any,
    };

    return [inFilter];
  }
}
