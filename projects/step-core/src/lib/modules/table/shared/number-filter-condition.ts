import { FilterCondition } from './filter-condition';
import { TableRequestFilter } from '../../../client/table/models/table-request-data';
import { TableCollectionFilter } from '../../../client/table/models/table-collection-filter';
import { CompareCondition } from '../../basics/shared/compare-condition.enum';

export class NumberFilterCondition extends FilterCondition {
  constructor(private searchValue?: string) {
    super();
  }
  toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    const value = parseInt(this.searchValue || '');
    if (isNaN(value)) {
      return [];
    }

    const numberFilter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.EQUALS,
        field,
        value,
      },
    };
    return [numberFilter];
  }
}
