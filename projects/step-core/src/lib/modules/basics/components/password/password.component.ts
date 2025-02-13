import { Component, forwardRef, input, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'step-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordComponent),
      multi: true,
    },
  ],
})
export class PasswordComponent implements ControlValueAccessor {
  placeholder = input<string>('Enter password');

  isPasswordVisible = false;
  isDisabled = false;
  value: string = '';

  // Angular Form Methods
  onChange: any = () => {};
  onTouched: any = () => {};

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
