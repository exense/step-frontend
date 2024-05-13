import { Component, input, output } from '@angular/core';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-relative-time-picker',
  templateUrl: './relative-time-picker.component.html',
  styleUrl: './relative-time-picker.component.scss',
})
export class RelativeTimePickerComponent {
  /** @Input() **/
  relativeTimes = input<KeyValue<number, string>[]>([]);

  /** @Output() **/
  pickRelativeTime = output<number>();
}
