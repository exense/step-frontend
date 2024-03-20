import { AbstractControl, ValidationErrors } from '@angular/forms';

export const numberValidator = (control: AbstractControl<unknown>): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  if (typeof control.value === 'number') {
    return null;
  }

  const num = parseFloat(control.value.toString());
  if (isNaN(num)) {
    return { invalidNumber: true };
  }

  return null;
};
