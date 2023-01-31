import { AbstractControl, ValidatorFn } from '@angular/forms';
import { DynamicValueString } from '../../../client/step-client-module';

const checkValue = (value: string | undefined) => (!value ? { dynamicFieldValidator: 'invalid' } : null);

export const DYNAMIC_FIELD_VALIDATOR: ValidatorFn = (control: AbstractControl) => {
  const value = control.value as DynamicValueString;
  if (!value) {
    return checkValue(value);
  }
  const result = value.dynamic ? checkValue(value.expression) : checkValue(value.value);
  return result;
};
