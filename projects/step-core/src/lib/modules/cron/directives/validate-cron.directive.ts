import { Directive, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { cronValidator } from '../types/cron-validator';

@Directive({
  selector: '[stepValidateCron]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ValidateCronDirective),
      multi: true,
    },
  ],
  standalone: false,
})
export class ValidateCronDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return cronValidator(control);
  }
}
