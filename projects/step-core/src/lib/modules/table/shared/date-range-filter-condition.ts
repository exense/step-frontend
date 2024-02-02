import { CompareCondition } from '../../basics/step-basics.module';
import { TableCollectionFilter, TableRequestFilter } from '../../../client/step-client-module';
import { FilterCondition } from './filter-condition';
import { FilterConditionType } from './filter-condition-type.enum';
import { DateTime } from 'luxon';
import { DateRange } from '../../date-picker/date-picker.module';

export class DateRangeFilterCondition extends FilterCondition<DateRange> {
  readonly filterConditionType = FilterConditionType.DATE_RANGE;

  constructor(rangeOrString?: DateRange | { start?: string; end?: string }) {
    let result: DateRange | undefined = undefined;
    if (rangeOrString) {
      let { start, end } = rangeOrString ?? {};
      start = typeof start === 'string' ? DateTime.fromISO(start) : start;
      end = typeof end === 'string' ? DateTime.fromISO(end) : end;
      result = { start, end };
    }
    super(result);
  }

  override isEmpty(): boolean {
    return !this.sourceObject;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.sourceObject) {
      return [];
    }

    const filterFrom = this.sourceObject.start
      ? ({
          collectionFilter: {
            type: CompareCondition.GREATER_THAN_OR_EQUAL,
            field,
            value: this.sourceObject.start.toMillis(),
          },
        } as TableCollectionFilter)
      : undefined;

    const filterTo = this.sourceObject.end
      ? ({
          collectionFilter: {
            type: CompareCondition.LOWER_THAN,
            field,
            value: this.sourceObject.end.toMillis(),
          },
        } as TableCollectionFilter)
      : undefined;

    return [filterFrom, filterTo].filter((filter) => !!filter);
  }
}
