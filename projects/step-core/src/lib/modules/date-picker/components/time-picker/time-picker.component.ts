import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DateFieldContainerService } from '../../injectables/date-field-container.service';
import { DateTime } from 'luxon';
import { DateRange } from '../../types/date-range';
import { Time } from '../../types/time';
import { TimeRange } from '../../types/time-range';
import { extractTime } from '../../types/extract-time';

@Component({
  selector: 'step-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  standalone: false,
})
export class TimePickerComponent implements OnChanges {
  readonly _isRange = inject(DateFieldContainerService).isRangeField();

  @Input() model?: DateTime | DateRange | null;

  @Output() timeChange = new EventEmitter<Time | TimeRange | undefined>();

  start?: Time;
  end?: Time;

  ngOnChanges(changes: SimpleChanges): void {
    const cModel = changes['model'];
    if (cModel?.previousValue !== cModel?.currentValue || cModel?.firstChange) {
      this.fillTime(cModel?.currentValue);
    }
  }

  handleStartChange(time?: Time): void {
    this.start = time;

    if (!this._isRange) {
      this.timeChange.emit(time);
      return;
    }

    this.timeChange.emit({ start: this.start, end: this.end });
  }

  handleEndChange(time?: Time): void {
    this.end = time;

    if (!this._isRange) {
      return;
    }

    this.timeChange.emit({ start: this.start, end: this.end });
  }

  private fillTime(model?: DateTime | DateRange): void {
    if (!model) {
      this.start = undefined;
      this.end = undefined;
      return;
    }

    if (!this._isRange) {
      this.start = extractTime(model as DateTime);
      return;
    }

    this.start = extractTime((model as DateRange).start);
    this.end = extractTime((model as DateRange).end);
  }
}
