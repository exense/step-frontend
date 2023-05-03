import { FilterCondition } from './filter-condition';
import { TableRequestFilter, TableCollectionFilter } from '../../../client/step-client-module';
import { DateTime } from 'luxon';
import { CompareCondition } from '../../basics/shared/compare-condition.enum';
import { FilterConditionType } from './filter-condition-type.enum';

export class SingleDateFilterCondition extends FilterCondition<DateTime> {
  readonly filterConditionType = FilterConditionType.SINGLE_DATE;

  constructor(dateOrString?: DateTime | string) {
    super(typeof dateOrString === 'string' ? DateTime.fromISO(dateOrString) : dateOrString);
  }

  override isEmpty(): boolean {
    return !this.sourceObject;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.sourceObject) {
      return [];
    }

    const dateFrom = this.sourceObject.toLocal().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

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
