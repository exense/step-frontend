import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseCustomFormInputComponent } from './base-custom-form-input.component';

@Component({
  selector: 'step-standard-custom-form-inputs',
  templateUrl: './standard-custom-form-input.component.html',
  styleUrls: ['./custom-form-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandardCustomFormInputComponent),
      multi: true,
    },
  ],
})
export class StandardCustomFormInputComponent extends BaseCustomFormInputComponent {
  @Input() hint?: string;
}
