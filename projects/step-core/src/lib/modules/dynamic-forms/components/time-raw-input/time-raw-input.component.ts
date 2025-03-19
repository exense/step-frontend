import { Component, EventEmitter, inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { ARRAY_KEY_VALUE_LABEL_VALUE_EXTRACTOR, TimeInputComponent } from '../../../basics/step-basics.module';
import { NgControl } from '@angular/forms';
import { NUMBER_CHARS_POSITIVE_ONLY } from '../../shared/constants';

@Component({
  selector: 'step-time-raw-input',
  templateUrl: './time-raw-input.component.html',
  styleUrls: ['./time-raw-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeRawInputComponent extends TimeInputComponent {
  protected readonly _timeUnitArrayItemExtractor = inject(ARRAY_KEY_VALUE_LABEL_VALUE_EXTRACTOR);

  @Input() parentControl?: NgControl;
  @Input() placeholder?: string;

  @Output() toggleDynamicExpression = new EventEmitter<void>();

  readonly allowedChars = NUMBER_CHARS_POSITIVE_ONLY;
}
