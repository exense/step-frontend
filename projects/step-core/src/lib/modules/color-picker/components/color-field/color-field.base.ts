import { ColorField } from '../../types/color-field';
import { Directive, effect, ElementRef, inject, input, Signal } from '@angular/core';
import { ColorPickerComponent } from '../color-picker/color-picker.component';

@Directive({})
export abstract class ColorFieldBase implements ColorField {
  protected _elRef = inject<ElementRef<HTMLElement>>(ElementRef);

  colorPicker = input<ColorPickerComponent | undefined>();

  private effectPickerChanged = effect(() => {
    this.colorPicker()?.registerInput(this);
  });

  getConnectedOverlayOrigin(): ElementRef | undefined {
    return this._elRef;
  }

  abstract getModel(): string | undefined;
  abstract setModel(value?: string): void;
  abstract isDisabled(): boolean;

  chooseColor(): void {
    if (this.isDisabled()) {
      return;
    }
    this.colorPicker()?.open();
  }
}
