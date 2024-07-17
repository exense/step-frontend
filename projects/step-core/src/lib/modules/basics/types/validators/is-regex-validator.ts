import { AbstractControl, ValidationErrors } from '@angular/forms';

export const isValidRegex = (value: string) => {
  try {
    new RegExp(value);
  } catch {
    return false;
  }
  return true;
};

export const isRegexValidator = (control: AbstractControl<unknown>): ValidationErrors | null => {
  const controlValue = control.value;

  if (typeof controlValue === 'string' && !isValidRegex(controlValue)) {
    return {
      invalidRegex: true,
    };
  }

  return null;
};
