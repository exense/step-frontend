import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseCustomFormInputComponent } from './base-custom-form-input.component';
import { CUSTOM_FORMS_COMMON_IMPORTS } from '../../types/custom-from-common-imports.contant';

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
  standalone: true,
  imports: [CUSTOM_FORMS_COMMON_IMPORTS],
})
export class StandardCustomFormInputComponent extends BaseCustomFormInputComponent {
  @Input() hideLabel?: boolean;
  @Input() hint?: string;
  @Input() required: boolean = false;
  @Input() withUnset: boolean = false;
}
