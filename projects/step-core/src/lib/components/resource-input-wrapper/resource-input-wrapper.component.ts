import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

type OnChange = (value: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-resource-input-wrapper',
  templateUrl: './resource-input-wrapper.component.html',
  styleUrls: ['./resource-input-wrapper.component.scss'],
  standalone: false,
})
export class ResourceInputWrapperComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() type!: string;
  @Input() directory?: boolean;
  @Input() tooltip?: string;
  @Input() showRequiredMarker?: boolean;

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

  onValueChange(value: string): void {
    this.value = value;
    this.onChange?.(value);
  }
}
