import { AbstractControl, ValidationErrors } from '@angular/forms';

const BOOL_VALUES = [true, false].map((x) => x.toString());

export const booleanValidator = (control: AbstractControl<unknown>): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const value = control.value.toString().trim().toLowerCase();
  if (BOOL_VALUES.includes(value)) {
    return null;
  }

  return {
    invalidBoolean: true,
  };
};
