import { AbstractControl, ValidationErrors } from '@angular/forms';

const R_ITEM_CHECK = /^(?:\w|-)+$/i;

export const comaSplitArrayValidator = (control: AbstractControl<unknown>): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const value = control.value.toString().trim();
  const items = value.split(',').map((item) => item.trim());
  const isValid = items.reduce((res, item) => res && R_ITEM_CHECK.test(item), true);
  if (isValid) {
    return null;
  }

  return {
    invalidComaSplitArray: true,
  };
};
