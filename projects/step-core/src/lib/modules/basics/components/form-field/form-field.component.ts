import { Component, computed, contentChild, input, ViewEncapsulation } from '@angular/core';
import { AbstractControl, NgControl, StatusChangeEvent, TouchedChangeEvent } from '@angular/forms';
import { getControlWarningsContainer } from '../../types/form-control-warnings-extension';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap } from 'rxjs';

export type AlignLabelAddon = 'separate' | 'near' | 'fill';

@Component({
  selector: 'step-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  exportAs: 'FormField',
  host: {
    '[class.ng-invalid]': 'isInvalid()',
    '[class.ng-touched]': 'isTouched()',
    '[class.step-has-warnings]': 'hasWarnings()',
  },
  encapsulation: ViewEncapsulation.None,
})
export class FormFieldComponent {
  readonly explicitControl = input<AbstractControl | null | undefined>(undefined, { alias: 'control' });
  readonly alignLabelAddon = input<AlignLabelAddon>('separate');
  readonly showRequiredMarker = input<boolean | undefined>(undefined);

  protected contentControl = contentChild(NgControl);

  protected readonly control = computed(() => {
    const contentControl = this.contentControl()?.control;
    return this.explicitControl() ?? contentControl;
  });

  private control$ = toObservable(this.control);
  private isInvalid$ = this.control$.pipe(
    filter((control) => !!control),
    switchMap((control) => control.events),
    filter((event) => event instanceof StatusChangeEvent),
    map((event) => event.status === 'INVALID'),
  );
  private isTouched$ = this.control$.pipe(
    filter((control) => !!control),
    switchMap((control) => control.events),
    filter((event) => event instanceof TouchedChangeEvent),
    map((event) => event.touched),
  );

  protected readonly isInvalid = toSignal(this.isInvalid$, {
    initialValue: this.control()?.invalid ?? false,
  });

  protected readonly isTouched = toSignal(this.isTouched$, {
    initialValue: this.control()?.touched ?? false,
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

  readonly controlErrors = computed(() => {
    const control = this.control();
    const isInvalid = this.isInvalid();
    if (isInvalid) {
      return control?.errors;
    }
    return undefined;
  });
}
