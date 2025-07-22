import { Component, input, output } from '@angular/core';
import { TimeOption, TimeOptionRelativeValue } from '../../types/time-option';
import { DateRange } from '../../types/date-range';
import { DateTime } from 'luxon';

@Component({
  selector: 'step-relative-time-picker',
  templateUrl: './relative-time-picker.component.html',
  styleUrl: './relative-time-picker.component.scss',
  standalone: false,
})
export class RelativeTimePickerComponent {
  /** @Input() **/
  relativeTimes = input<TimeOption[]>([]);

  /** @Output() **/
  rangeChange = output<DateRange>();

  /** @Output() **/
  relativeOptionChange = output<TimeOption | undefined>();

  protected pickOption(timeOption: TimeOption): void {
    let range: DateRange;

    if ((timeOption.value as TimeOptionRelativeValue).isRelative) {
      this.relativeOptionChange.emit(timeOption);
      const ms = (timeOption.value as TimeOptionRelativeValue).msFromNow;
      const end = DateTime.now();
      const start = end.set({ millisecond: end.millisecond - ms });
      range = { start, end };
    } else {
      this.relativeOptionChange.emit(undefined);
      range = timeOption.value as DateRange;
    }

    this.rangeChange.emit(range);
  }
}
