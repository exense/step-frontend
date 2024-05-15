import { Component, input, output } from '@angular/core';
import { TimeOption, TimeOptionRelativeValue } from '../../types/time-option';
import { DateRange } from '../../types/date-range';
import { DateTime } from 'luxon';

@Component({
  selector: 'step-relative-time-picker',
  templateUrl: './relative-time-picker.component.html',
  styleUrl: './relative-time-picker.component.scss',
})
export class RelativeTimePickerComponent {
  /** @Input() **/
  relativeTimes = input<TimeOption[]>([]);

  /** @Output() **/
  pickRelativeTime = output<DateRange>();

  protected pickOption(timeOption: TimeOption): void {
    let range: DateRange;

    if ((timeOption.value as TimeOptionRelativeValue).isRelative) {
      const ms = (timeOption.value as TimeOptionRelativeValue).msFromNow;
      const end = DateTime.now();
      const start = end.set({ millisecond: end.millisecond - ms });
      range = { start, end };
    } else {
      range = timeOption.value as DateRange;
    }

    this.pickRelativeTime.emit(range);
  }
}
