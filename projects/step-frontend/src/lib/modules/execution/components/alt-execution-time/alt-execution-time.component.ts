import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import {
  DateFormat,
  DateRangeAdapterService,
  DateSingleAdapterService,
  DurationPipe,
  STEP_DATE_TIME_FORMAT_PROVIDERS,
} from '@exense/step-core';
import { DatePipe } from '@angular/common';

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
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionTimeComponent {
  private _datePipe = inject(DatePipe);
  private _durationPipe = inject(DurationPipe);

  private todayDate = this._datePipe.transform(new Date().getTime(), DateFormat.DATE_SHORT);

  readonly startTimeInput = input<number | undefined>(undefined, { alias: 'startTime' });
  readonly endTimeInput = input<number | undefined>(undefined, { alias: 'endTime' });
  readonly durationInput = input<number | undefined>(undefined, { alias: 'duration' });
  readonly isRunning = input(false);
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

  protected readonly endTime = computed(() => {
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

  protected hasContent = computed(() => {
    const displayDate = this.displayDate();
    const duration = this.duration();
    return !!displayDate || !!duration;
  });
}
