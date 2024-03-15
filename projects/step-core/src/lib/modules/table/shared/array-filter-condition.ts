import { CompareCondition } from '../../basics/step-basics.module';
import { TableCollectionFilter, TableRequestFilter } from '../../../client/step-client-module';
import { FilterCondition } from './filter-condition';
import { FilterConditionType } from './filter-condition-type.enum';

interface ArrayFilterConditionSource {
  items?: string[];
  fields?: string[];
}

export class ArrayFilterCondition extends FilterCondition<ArrayFilterConditionSource> {
  readonly filterConditionType = FilterConditionType.ARRAY;

  constructor(source?: ArrayFilterConditionSource) {
    super(source);
  }

  override isEmpty(): boolean {
    return !this.sourceObject?.items?.length;
  }

  override getSearchValue(): unknown {
    return this.sourceObject?.items;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    const valueArray = this.sourceObject?.items ?? [];
    const fields = this.sourceObject?.fields ?? [field];

    const children = fields.reduce(
      (result, field) => {
        const conditions = valueArray.map((expectedValue) => ({
          field,
          type: CompareCondition.EQUALS,
          expectedValue,
        }));

        return result.concat(conditions);
      },
      [] as { field: string; type: CompareCondition; expectedValue: string }[],
    );

    const arrayFilter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.OR,
        children,
      },
    };

    return children?.length > 0 ? [arrayFilter] : [];
  }
}
