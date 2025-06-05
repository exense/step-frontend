import { Component, computed, contentChild, input, Input, ViewEncapsulation } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
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
  standalone: false,
})
export class FormFieldComponent {
  /*
    In some rare cases `step-form-field` content may include more than one controls.
    In that case value control should be explicitly specified with `control` input.
    Otherwise, it will be automatically determined by contentChild

    @Input()
  */
  readonly explicitControl = input<AbstractControl | undefined>(undefined, { alias: 'control' });

  /* @ContentChild(NgControl) */
  protected contentControl = contentChild(NgControl);

  protected readonly control = computed(() => {
    const contentControl = this.contentControl()?.control;
    return this.explicitControl() ?? contentControl;
  });

  protected hasWarnings = computed(() => {
    const control = this.control();
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
