import { AbstractControl, ValidationErrors } from '@angular/forms';

export function valueValidator(control: AbstractControl): ValidationErrors | null {
  const predicate = control.get('predicate')?.value;
  const value = control.get('value')?.value;

  if (predicate != 'exists' && predicate != 'not_exists' && !value) {
    return { valueRequired: true };
  }

  return null;
}
