import { ChangeDetectionStrategy, Component, forwardRef, HostBinding, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { COLORS } from '../../injectables/colors.token';

type OnChange = (value: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-color-chooser',
  standalone: true,
  imports: [StepBasicsModule],
  templateUrl: './color-chooser.component.html',
  styleUrl: './color-chooser.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorChooserComponent),
      multi: true,
    },
  ],
})
export class ColorChooserComponent implements ControlValueAccessor {
  protected readonly _colors = [...inject(COLORS), ''];

  protected selectedColor?: string;

  @HostBinding('class.disabled')
  protected isDisabled?: boolean;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  writeValue(value: string): void {
    this.selectedColor = value;
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

  protected selectColor(color: string): void {
    if (this.isDisabled) {
      return;
    }
    this.selectedColor = color;
    this.onChange?.(color);
    this.onTouch?.();
  }
}
