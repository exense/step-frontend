import { Directive, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { jsonValidator } from '../types/validators/json-validator';

@Directive({
  selector: '[stepValidateJson]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ValidateJsonDirective),
      multi: true,
    },
  ],
  standalone: false,
})
export class ValidateJsonDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return jsonValidator(control);
  }
}
