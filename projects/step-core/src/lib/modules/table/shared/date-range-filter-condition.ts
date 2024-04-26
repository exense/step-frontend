import { CompareCondition } from '../../basics/step-basics.module';
import { TableCollectionFilter, TableRequestFilter } from '../../../client/step-client-module';
import { FilterCondition } from './filter-condition';
import { FilterConditionType } from './filter-condition-type.enum';
import { DateTime } from 'luxon';
import { DateRange } from '../../date-picker/date-picker.module';

export interface DateRangFilterConditionSource {
  range?: DateRange | { start?: string; end?: string };
  columnsOverride?: { start?: string; end?: string };
}

export class DateRangeFilterCondition extends FilterCondition<DateRangFilterConditionSource> {
  readonly filterConditionType = FilterConditionType.DATE_RANGE;

  constructor(source: DateRangFilterConditionSource) {
    super(source);
  }

  override isEmpty(): boolean {
    return !this.sourceObject;
  }

  override toRequestFilterInternal(field: string): Array<TableRequestFilter | undefined> {
    const range = this.getRange();
    if (!range) {
      return [];
    }

    const fieldFrom = this.sourceObject?.columnsOverride?.start ?? field;
    const fieldTo = this.sourceObject?.columnsOverride?.end ?? field;

    const filterFrom = range.start
      ? ({
          collectionFilter: {
            type: CompareCondition.GREATER_THAN_OR_EQUAL,
            field: fieldFrom,
            value: range.start.toMillis(),
          },
        } as TableCollectionFilter)
      : undefined;

    const filterTo = range.end
      ? ({
          collectionFilter: {
            type: CompareCondition.LOWER_THAN,
            field: fieldTo,
            value: range.end.toMillis(),
          },
        } as TableCollectionFilter)
      : undefined;

    return [filterFrom, filterTo].filter((filter) => !!filter);
  }

  override getSearchValue(): unknown {
    return this.getRange();
  }

  private getRange(): DateRange | undefined {
    let result: DateRange | undefined = undefined;
    if (this.sourceObject?.range) {
      let { start, end } = this.sourceObject.range ?? {};
      start = typeof start === 'string' ? DateTime.fromISO(start) : start;
      end = typeof end === 'string' ? DateTime.fromISO(end) : end;
      result = { start, end };
    }
    return result;
  }
}
