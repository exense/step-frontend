import { AbstractControl, ValidationErrors } from '@angular/forms';

export const jsonValidator = (control: AbstractControl<string>): ValidationErrors | null => {
  const jsonString = control.value;
  if (!jsonString) {
    return null;
  }

  try {
    JSON.parse(jsonString);
  } catch (error) {
    return { json: true };
  }

  return null;
};
