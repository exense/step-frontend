import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CronValidation } from './cron/_cron-validation';

export const cronValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!CronValidation.validate(control.value)) {
    return {
      cron: 'invalid cron expression',
    };
  }

  return null;
};
