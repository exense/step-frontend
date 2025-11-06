import { AbstractControl, ValidatorFn } from '@angular/forms';

interface ValidatorsAggregatedInfo {
  add?: ValidatorFn[];
  remove?: ValidatorFn[];
}

export const toggleValidators = (
  isValidatorsActive: boolean,
  control: AbstractControl,
  ...validators: ValidatorFn[]
) => {
  const aggregated = validators.reduce((res, validator) => {
    if (isValidatorsActive && !control.hasValidator(validator)) {
      res.add = res.add ?? [];
      res.add.push(validator);
    } else if (!isValidatorsActive && control.hasValidator(validator)) {
      res.remove = res.remove ?? [];
      res.remove.push(validator);
    }
    return res;
  }, {} as ValidatorsAggregatedInfo);

  if (aggregated.add?.length) {
    control.addValidators(aggregated.add);
  }
  if (aggregated.remove?.length) {
    control.removeValidators(aggregated.remove);
  }

  if (!!aggregated?.add?.length || !!aggregated?.remove?.length) {
    control.updateValueAndValidity();
  }
};
