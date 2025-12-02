import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function pairRequiredValidator(aKey: string, bKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(aKey);
    const b = group.get(bKey);

    const aVal = (a?.value ?? '').toString().trim();
    const bVal = (b?.value ?? '').toString().trim();

    const oneMissing = (!!aVal && !bVal) || (!!bVal && !aVal);

    const setKeyError = (ctrl: AbstractControl | null, key: string, on: boolean) => {
      if (!ctrl) return;
      const errs = { ...(ctrl.errors ?? {}) };
      if (on) {
        errs[key] = true;
        ctrl.setErrors(errs);
      } else if (key in errs) {
        delete errs[key];
        ctrl.setErrors(Object.keys(errs).length ? errs : null);
      }
    };

    if (!aVal) {
      setKeyError(a, 'requiredWhenOtherPresent', oneMissing);
    }
    if (!bVal) {
      setKeyError(b, 'requiredWhenOtherPresent', oneMissing);
    }

    return oneMissing ? { pairRequired: { fields: [aKey, bKey] } } : null;
  };
}
