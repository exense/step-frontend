import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DateFormat, DurationPipe, Execution } from '@exense/step-core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'step-alt-execution-time',
  templateUrl: './alt-execution-time.component.html',
  styleUrl: './alt-execution-time.component.scss',
  providers: [DatePipe, DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltExecutionTimeComponent {
  private _datePipe = inject(DatePipe);
  private _durationPipe = inject(DurationPipe);

  private todayDate = this._datePipe.transform(new Date().getTime(), DateFormat.DATE_SHORT);

  execution = input<Execution | undefined>(undefined);

  readonly date = computed(() => {
    const startTime = this.execution()?.startTime;
    if (!startTime) {
      return '';
    }
    const date = this._datePipe.transform(startTime, DateFormat.DATE_SHORT);
    return date === this.todayDate ? 'Today' : date;
  });

  readonly duration = computed(() => {
    const execution = this.execution();
    if (!execution?.endTime) {
      return '';
    }
    return this._durationPipe.transform(execution.endTime, execution.startTime);
  });
}
