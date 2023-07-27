import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { getFlatControls } from './utils';

export const higherOrderValidator = <T extends AbstractControl>(abstractControl: T): ValidatorFn => {
  return (): ValidationErrors | null => {
    if (abstractControl.valid) {
      return null;
    }

    const flatControls = getFlatControls(abstractControl);
    const errors = flatControls.reduce(
      (acc, control) => ({
        ...acc,
        ...control.errors,
      }),
      {} as ValidationErrors
    );

    return errors;
  };
};
