import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { TimeInputComponent } from '../../../basics/step-basics.module';
import { NgControl } from '@angular/forms';
import { NUMBER_CHARS_POSITIVE_ONLY } from '../../shared/constants';

@Component({
  selector: 'step-time-raw-input',
  templateUrl: './time-raw-input.component.html',
  styleUrls: ['./time-raw-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeRawInputComponent extends TimeInputComponent {
  @Input() parentControl?: NgControl;
  @Input() placeholder?: string;

  @Output() editConstantValue = new EventEmitter<void>();
  @Output() toggleDynamicExpression = new EventEmitter<void>();

  readonly allowedChars = NUMBER_CHARS_POSITIVE_ONLY;
}
