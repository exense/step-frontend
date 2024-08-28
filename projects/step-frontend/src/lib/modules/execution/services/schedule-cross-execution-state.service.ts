import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateRange, DateUtilsService } from '@exense/step-core';
import { BehaviorSubject } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { TimeRange } from '@exense/step-core';
import { RangePickerStatesService } from './range-picker-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class ScheduleCrossExecutionStateService extends RangePickerStatesService {
  readonly dateRangeCtrl = new FormControl<DateRange | null | undefined>(null);
  private readonly _isFullRangeSelected$ = new BehaviorSubject<boolean>(false);
  readonly isFullRangeSelected$ = this._isFullRangeSelected$.asObservable();

  constructor(private _dateUtils: DateUtilsService) {
    super();
  }

  readonly dateRange$ = this.dateRangeCtrl.valueChanges.pipe(
    startWith(this.dateRangeCtrl.value),
    map((range) => range ?? undefined),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly timeRange$ = this.dateRange$.pipe(
    map((dateRange) => this._dateUtils.dateRange2TimeRange(dateRange)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  updateRange(timeRange?: TimeRange | null): void {
    this.dateRangeCtrl.setValue(this._dateUtils.timeRange2DateRange(timeRange));
  }

  updateRelativeTime(time?: number): void {
    if (time !== undefined) {
      console.log(`Relative time updated to: ${time}`);
    }
  }

  selectFullRange(): void {
    this._isFullRangeSelected$.next(true);
  }
}
