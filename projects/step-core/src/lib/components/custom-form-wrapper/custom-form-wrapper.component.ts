import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

type OnChange = (value?: Record<string, unknown>) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-custom-form-wrapper',
  templateUrl: './custom-form-wrapper.component.html',
  styleUrls: ['./custom-form-wrapper.component.scss'],
})
export class CustomFormWrapperComponent implements ControlValueAccessor {
  @Input() stEditableLabelMode = false;
  @Input() stScreen!: string;
  @Input() stInline: boolean = false;
  @Input() stExcludeFields: string[] = [];
  @Input() showRequiredMarker: boolean = false;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected value: Record<string, unknown> = {};
  protected isDisabled: boolean = false;

  constructor(readonly _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  writeValue(value?: Record<string, unknown>): void {
    this.value = value ?? {};
  }

  registerOnChange(onChange: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  protected onValueChange(value: Record<string, unknown>): void {
    this.onChange?.(value);
  }

  protected onCustomInputTouched(): void {
    this.onTouch?.();
  }
}
