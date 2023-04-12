import { FilterCondition } from './filter-condition';
import { TableRequestFilter } from '../../../client/table/models/table-request-data';
import { DateTime } from 'luxon';
import { CompareCondition } from '../../basics/shared/compare-condition.enum';
import { TableCollectionFilter } from '../../../client/table/models/table-collection-filter';

export class SingleDateFilterCondition extends FilterCondition {
  constructor(private date?: DateTime) {
    super();
  }

  override isEmpty(): boolean {
    return !this.date;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.date) {
      return [];
    }

    const dateFrom = this.date.toLocal().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    const dateTo = dateFrom.plus({ day: 1 });

    const filterFrom: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.GREATER_THAN_OR_EQUAL,
        field,
        value: dateFrom.toMillis(),
      },
    };

    const filterTo: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.LOWER_THAN,
        field,
        value: dateTo.toMillis(),
      },
    };

    return [filterFrom, filterTo];
  }
}
