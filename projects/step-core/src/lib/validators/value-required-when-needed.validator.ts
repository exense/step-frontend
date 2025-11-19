import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Predicate } from '../types/predicate.enum';

export const valueRequiredWhenNeededValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  if (!group) return null;

  const predicateCtrl = group.get('predicate');
  const valueCtrl = group.get('value');

  if (!predicateCtrl || !valueCtrl) return null;

  const pred = predicateCtrl.value as Predicate | string | undefined;
  const raw = valueCtrl.value as unknown;
  const str = typeof raw === 'string' ? raw.trim() : (raw ?? '').toString().trim();

  const needsValue = pred !== Predicate.EXISTS && pred !== Predicate.NOT_EXISTS;

  const hasError = needsValue && !str;

  setKeyError(valueCtrl, 'valueRequired', hasError);

  return hasError ? { valueRequired: true } : null;
};

function setKeyError(ctrl: AbstractControl, key: string, on: boolean) {
  const current = ctrl.errors ?? {};
  if (on) {
    if (!current[key]) ctrl.setErrors({ ...current, [key]: true });
  } else if (current[key]) {
    const { [key]: _, ...rest } = current;
    ctrl.setErrors(Object.keys(rest).length ? rest : null);
  }
}
