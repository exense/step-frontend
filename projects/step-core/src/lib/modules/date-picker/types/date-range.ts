import { DateTime } from 'luxon';

export interface DateRange {
  start?: DateTime | null;
  end?: DateTime | null;
}
