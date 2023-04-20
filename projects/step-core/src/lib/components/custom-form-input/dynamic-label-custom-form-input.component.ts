import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseCustomFormInputComponent } from './base-custom-form-input.component';

@Component({
  selector: 'step-dynamic-label-custom-form-inputs',
  templateUrl: './dynamic-label-custom-form-input.component.html',
  styleUrls: ['./custom-form-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicLabelCustomFormInputComponent),
      multi: true,
    },
  ],
})
export class DynamicLabelCustomFormInputComponent extends BaseCustomFormInputComponent {}
