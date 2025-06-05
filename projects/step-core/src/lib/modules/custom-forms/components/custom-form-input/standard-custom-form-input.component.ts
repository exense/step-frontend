import { Component, forwardRef, input, Input, ViewEncapsulation } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BaseCustomFormInputComponent } from './base-custom-form-input.component';
import { CUSTOM_FORMS_COMMON_IMPORTS } from '../../types/custom-from-common-imports.contant';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

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
  imports: [CUSTOM_FORMS_COMMON_IMPORTS, ReactiveFormsModule, FormsModule, NgxMatSelectSearchModule],
  encapsulation: ViewEncapsulation.None,
})
export class StandardCustomFormInputComponent extends BaseCustomFormInputComponent {
  readonly hideLabel = input(false);
  readonly hint = input('');
  readonly required = input(false);
}
