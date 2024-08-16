import { Component, ContentChild, Input, ViewEncapsulation } from '@angular/core';
import { NgControl } from '@angular/forms';
@Component({
  selector: 'step-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  host: {
    '[class.ng-invalid]': 'control?.invalid',
    '[class.ng-touched]': 'control?.touched',
  },
  encapsulation: ViewEncapsulation.None,
})
export class FormFieldComponent {
  @ContentChild(NgControl)
  control?: NgControl;

  @Input() alignLabelAddon: 'separate' | 'near' | 'fill' = 'separate';
  @Input() showRequiredMarker?: boolean;
}
