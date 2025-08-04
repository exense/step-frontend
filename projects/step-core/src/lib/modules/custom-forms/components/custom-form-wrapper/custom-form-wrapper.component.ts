import { Component, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { CustomFormComponent } from '../custom-form/custom-form.component';
import { Observable } from 'rxjs';

type OnChange = (value?: Record<string, unknown>) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-custom-form-wrapper',
  templateUrl: './custom-form-wrapper.component.html',
  styleUrls: ['./custom-form-wrapper.component.scss'],
  standalone: true,
  imports: [CustomFormComponent],
})
export class CustomFormWrapperComponent implements ControlValueAccessor {
  readonly stEditableLabelMode = input(false);
  readonly stScreen = input.required<string>();
  readonly stInline = input(false);
  readonly stExcludeFields = input<string[]>([]);
  readonly stIncludeFieldsOnly = input<string[] | undefined>(undefined);
  readonly showRequiredMarker = input(false);

  private customForm = viewChild(CustomFormComponent);

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected value: Record<string, unknown> = {};
  protected isDisabled = signal(false);

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

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  readyToProceed(): Observable<void> {
    return this.customForm()!.readyToProceed();
  }

  protected onValueChange(value: Record<string, unknown>): void {
    this.onChange?.(value);
  }

  protected onCustomInputTouched(): void {
    this.onTouch?.();
  }
}
