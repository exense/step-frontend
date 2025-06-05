import { KeyValue } from '@angular/common';
import { Component, Input, Optional, TrackByFunction } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

type OnChange = (value: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-predefined-options-input',
  templateUrl: './predefined-options-input.component.html',
  styleUrls: ['./predefined-options-input.component.scss'],
  standalone: false,
})
export class PredefinedOptionsInputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string = '';
  @Input() predefinedOptions!: KeyValue<string, string>[];
  @Input() predefinedOptionsLabel!: string;
  @Input() showRequiredMarker?: boolean;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected readonly predefinedOptionsTrackBy: TrackByFunction<KeyValue<string, string>> = (index, item) => item.key;

  protected isDisabled: boolean = false;
  protected value: string = '';

  constructor(@Optional() readonly _ngControl?: NgControl) {
    if (!this._ngControl) {
      return;
    }

    this._ngControl.valueAccessor = this;
  }

  writeValue(value?: string): void {
    this.value = value ?? '';
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

  protected onValueChange(value: string): void {
    this.value = value;
    this.onTouch?.();
    this.onChange?.(value);
  }

  protected onBlur(): void {
    this.onTouch?.();
  }
}
