import { Component, computed, contentChild, ContentChild, Input, ViewEncapsulation } from '@angular/core';
import { NgControl } from '@angular/forms';
import { getControlWarningsContainer } from '../../types/form-control-warnings-extension';
@Component({
  selector: 'step-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  host: {
    '[class.ng-invalid]': 'control()?.invalid',
    '[class.ng-touched]': 'control()?.touched',
    '[class.step-has-warnings]': 'hasWarnings()',
  },
  encapsulation: ViewEncapsulation.None,
})
export class FormFieldComponent {
  /* @ContentChild(NgControl) */
  control = contentChild(NgControl);

  protected hasWarnings = computed(() => {
    const control = this.control()?.control;
    if (!control) {
      return false;
    }
    const warningsContainer = getControlWarningsContainer(control);
    if (!warningsContainer) {
      return false;
    }
    return warningsContainer.hasWarnings();
  });

  @Input() alignLabelAddon: 'separate' | 'near' | 'fill' = 'separate';
  @Input() showRequiredMarker?: boolean;
}
