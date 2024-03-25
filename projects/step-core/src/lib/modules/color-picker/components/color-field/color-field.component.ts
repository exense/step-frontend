import { ColorFieldBase } from './color-field.base';
import { ChangeDetectionStrategy, Component, forwardRef, HostListener } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type OnChange = (value?: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-color-field',
  templateUrl: './color-field.component.html',
  styleUrl: './color-field.component.scss',
  standalone: true,
  imports: [StepBasicsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorFieldComponent),
      multi: true,
    },
  ],
})
export class ColorFieldComponent extends ColorFieldBase implements ControlValueAccessor {
  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected model?: string;

  protected disabled = false;

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(model?: string): void {
    this.model = model;
  }

  override getModel(): string | undefined {
    return this.model;
  }

  override isDisabled(): boolean {
    return this.disabled;
  }

  override setModel(value?: string): void {
    this.model = value;
    this.onChange?.(value);
  }

  @HostListener('blur')
  private handleBlur(): void {
    this.onTouch?.();
  }
}
