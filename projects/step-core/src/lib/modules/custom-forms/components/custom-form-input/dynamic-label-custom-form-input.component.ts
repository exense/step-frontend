import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseCustomFormInputComponent } from './base-custom-form-input.component';
import { EditableDropdownLabelComponent, EditableLabelComponent } from '../../../editable-labels';
import { CUSTOM_FORMS_COMMON_IMPORTS } from '../../types/custom-from-common-imports.contant';

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
  standalone: true,
  imports: [CUSTOM_FORMS_COMMON_IMPORTS, EditableLabelComponent, EditableDropdownLabelComponent],
})
export class DynamicLabelCustomFormInputComponent extends BaseCustomFormInputComponent {
  @Input() withUnset: boolean = false;
}
