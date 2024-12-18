import { FormControl } from '@angular/forms';
import { DateRange, TimeRange } from '@exense/step-core';
import { Observable } from 'rxjs';

export abstract class RangePickerStatesService {
  abstract readonly dateRangeCtrl: FormControl<DateRange | null | undefined>;
  abstract readonly isFullRangeSelected$: Observable<boolean>;
  abstract readonly dateRange$: Observable<DateRange | undefined>;
  abstract readonly timeRange$: Observable<TimeRange | undefined>;

  abstract updateRange(timeRange?: TimeRange | null): void;
  abstract updateRelativeTime(time?: number): void;
  abstract selectFullRange(): void;
}
