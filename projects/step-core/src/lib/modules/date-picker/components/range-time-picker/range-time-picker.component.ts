import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Time } from '../../types/time';

@Component({
  selector: 'step-range-time-picker',
  templateUrl: './range-time-picker.component.html',
  styleUrls: ['./range-time-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class RangeTimePickerComponent {
  @Input() startTime?: Time;
  @Input() endTime?: Time;

  @Output() startTimeChange = new EventEmitter<Time>();
  @Output() endTimeChange = new EventEmitter<Time>();

  handleStartTimeChange(startTime: Time): void {
    this.startTime = startTime;
    this.startTimeChange.emit(startTime);
  }

  handleEndTimeChange(endTime: Time): void {
    this.endTime = endTime;
    this.endTimeChange.emit(endTime);
  }
}
