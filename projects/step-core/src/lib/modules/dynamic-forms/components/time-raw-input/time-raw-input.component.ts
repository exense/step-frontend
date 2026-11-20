import { Component, EventEmitter, inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { DYNAMIC_EXPRESSION_TOGGLE_TOOLTIP, TimeInputComponent } from '../../../basics/step-basics.module';
import { NgControl } from '@angular/forms';
import { NUMBER_CHARS_POSITIVE_ONLY } from '../../shared/constants';

@Component({
  selector: 'step-time-raw-input',
  templateUrl: './time-raw-input.component.html',
  styleUrls: ['./time-raw-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class TimeRawInputComponent extends TimeInputComponent {
  @Input() parentControl?: NgControl;
  @Input() placeholder?: string;

  @Output() toggleDynamicExpression = new EventEmitter<void>();

  readonly allowedChars = NUMBER_CHARS_POSITIVE_ONLY;
  protected readonly _toggleTooltip = inject(DYNAMIC_EXPRESSION_TOGGLE_TOOLTIP);
}
