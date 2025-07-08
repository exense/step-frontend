import { Component, input, Input } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

type OnChange = (value: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-resource-input-wrapper',
  templateUrl: './resource-input-wrapper.component.html',
  styleUrls: ['./resource-input-wrapper.component.scss'],
})
export class ResourceInputWrapperComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly type = input.required<string>();
  readonly supportsDirectory = input(false);
  readonly tooltip = input<string>();
  readonly showRequiredMarker = input(false);

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected value?: string;
  protected isDisabled?: boolean;

  constructor(protected _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onBlur(): void {
    this.onTouch?.();
  }

  onValueChange(value: string = ''): void {
    this.value = value;
    this.onChange?.(value);
  }
}
