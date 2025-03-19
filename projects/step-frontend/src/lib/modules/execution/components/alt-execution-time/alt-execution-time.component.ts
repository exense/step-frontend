import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  DateFormat,
  DateRangeAdapterService,
  DateSingleAdapterService,
  DurationPipe,
  STEP_DATE_TIME_FORMAT_PROVIDERS,
} from '@exense/step-core';
import { DatePipe } from '@angular/common';
import { DateTime } from 'luxon';

@Component({
  selector: 'step-alt-execution-time',
  templateUrl: './alt-execution-time.component.html',
  styleUrl: './alt-execution-time.component.scss',
  providers: [
    DatePipe,
    DurationPipe,
    STEP_DATE_TIME_FORMAT_PROVIDERS,
    DateSingleAdapterService,
    DateRangeAdapterService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltExecutionTimeComponent {
  private _datePipe = inject(DatePipe);
  private _durationPipe = inject(DurationPipe);
  private _dateRangeAdapter = inject(DateRangeAdapterService);

  private todayDate = this._datePipe.transform(new Date().getTime(), DateFormat.DATE_SHORT);

  readonly startTimeInput = input<number | undefined>(undefined, { alias: 'startTime' });
  readonly endTimeInput = input<number | undefined>(undefined, { alias: 'endTime' });
  readonly durationInput = input<number | undefined>(undefined, { alias: 'duration' });
  readonly timeOnly = input(false);

  protected readonly displayDate = computed(() => {
    const startTime = this.startTimeInput();
    const isTimeOnly = this.timeOnly();
    if (!startTime) {
      return '';
    }
    if (isTimeOnly) {
      return this._datePipe.transform(startTime, DateFormat.TIME);
    }
    const date = this._datePipe.transform(startTime, DateFormat.DATE_SHORT);
    return date === this.todayDate ? 'Today' : date;
  });

  private endTime = computed(() => {
    const startTime = this.startTimeInput();
    let endTime = this.endTimeInput();
    const duration = this.durationInput();

    if (endTime !== undefined) {
      return endTime;
    }

    if (startTime !== undefined && duration !== undefined) {
      return startTime + duration;
    }

    return undefined;
  });

  protected readonly duration = computed(() => {
    const startTime = this.startTimeInput();
    const endTime = this.endTime();

    if (startTime === undefined || endTime === undefined) {
      return '';
    }

    return this._durationPipe.transform(endTime, startTime);
  });

  protected readonly dateTooltip = computed(() => {
    const startTime = this.startTimeInput();
    const endTime = this.endTime();
    const start = startTime ? DateTime.fromMillis(startTime) : undefined;
    const end = endTime ? DateTime.fromMillis(endTime) : undefined;
    return this._dateRangeAdapter.format({ start, end }, true);
  });
}
